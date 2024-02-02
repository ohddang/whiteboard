import { useState, useEffect, useRef } from "react";
import {
  Site,
  Rect,
  DrawElement,
  PickingElement,
  Color,
  ToolType,
} from "../type/common";
import DrawElementCanvas from "./DrawElementCanvas";
import { useSelectedToolStore } from "../store/store";

const Board: React.FC = () => {
  const mainCanvas = useRef<HTMLCanvasElement>(null);
  const pickingCanvas = useRef<HTMLCanvasElement>(null);
  const [mainContext, setMainContext] = useState<CanvasRenderingContext2D>();
  const [pickingContext, setPickingContext] =
    useState<CanvasRenderingContext2D>();

  const [path, setPath] = useState<Array<Site>>([]); // FIXME : [] -> start, end
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [drawElements, setDrawElements] = useState<Array<DrawElement>>([]);
  const [pickingElements, setPickingElements] = useState<Array<PickingElement>>(
    []
  );
  const [currentPickColor, setCurrentPickColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  }); // fix it type

  const [currentSite, setCurrentSite] = useState<Site>([0, 0]);
  const { tool, setTool, getTool } = useSelectedToolStore();

  const onMouseDown = (e: MouseEvent) => {
    switch (getTool()) {
      case ToolType.RECT:
      case ToolType.ARROW:
      case ToolType.TEXT:
        path.push([e.clientX, e.clientY]);
        setPath(path);
        setIsDrag(true);
        if (currentPickColor !== undefined) {
          currentPickColor.r = Math.floor(Math.random() * 255);
          currentPickColor.g = Math.floor(Math.random() * 255);
          currentPickColor.b = Math.floor(Math.random() * 255);
          currentPickColor.a = 1;
          setCurrentPickColor(currentPickColor);
        }
        break;
      case ToolType.SELECT:
      case ToolType.MOVE:
        selectElement(e.clientX, e.clientY);
        break;
      default:
        break;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    switch (getTool()) {
      case ToolType.RECT:
      case ToolType.ARROW:
        if (isDrag) {
          if (
            Math.abs(path[0][0] - e.pageX) < 10 &&
            Math.abs(path[0][1] - e.pageY) < 10
          )
            return;

          if (path.length > 1) path.pop();

          path.push([e.pageX, e.pageY]);
          setPath(path);
          setCurrentSite([e.pageX, e.pageY]);
        }
        break;
      case ToolType.MOVE:
        break;
      default:
        break;
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    if (getTool() === ToolType.RECT || getTool() === ToolType.ARROW) {
      setIsDrag(false);
      addDrawElements(); // fix : drawelement와 pickingelement가 마우스를 빠르게 움직이면 달라짐..
      addPickingElements();

      path.splice(0, path.length);
      setPath(path);

      if (mainContext) {
        mainContext.clearRect(
          0,
          0,
          mainContext.canvas.width,
          mainContext.canvas.height
        );
      }
    }
  };

  const onResize = (e: any) => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
    }
    const pickctx = pickingCanvas.current?.getContext("2d");
    if (pickctx) {
      pickctx.canvas.width = window.innerWidth;
      pickctx.canvas.height = window.innerHeight;
    }
  };

  const drawElement = (context: CanvasRenderingContext2D | undefined): void => {
    context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (path.length <= 1) return;

    if (context) {
      if (context === mainContext) {
        context.strokeStyle = "#ca5";
        context.lineWidth = 5;
      } else if (context === pickingContext) {
        context.strokeStyle = `rgba(${currentPickColor?.r}, ${currentPickColor?.g}, ${currentPickColor?.b}, ${currentPickColor?.a})`;
        context.lineWidth = 15;
      }

      const rect = getRect();
      context.beginPath();
      switch (getTool()) {
        case ToolType.RECT:
          context.rect(rect.left, rect.top, rect.width, rect.height);
          break;
        case ToolType.ARROW:
          context.moveTo(path[0][0], path[0][1]);
          path.forEach((pos) => {
            context.lineTo(pos[0], pos[1]);
          });
          break;
      }
      context.stroke();
    }
  };

  const addDrawElements = (): void => {
    const newElement = getDrawElement();
    if (newElement) {
      drawElements.push(newElement);
      setDrawElements(drawElements);
    }
  };

  const addPickingElements = (): void => {
    const newPickElement = getPickingElement();
    if (newPickElement) {
      pickingElements.push(newPickElement);
      setPickingElements(pickingElements);
    }
  };

  const getRect = (): Rect => {
    let max_x = Number.MIN_SAFE_INTEGER;
    let min_x = Number.MAX_SAFE_INTEGER;
    let max_y = Number.MIN_SAFE_INTEGER;
    let min_y = Number.MAX_SAFE_INTEGER;

    path.forEach((pos) => {
      if (pos[0] > max_x) max_x = pos[0];
      if (pos[0] < min_x) min_x = pos[0];
      if (pos[1] > max_y) max_y = pos[1];
      if (pos[1] < min_y) min_y = pos[1];
    });

    return {
      left: min_x,
      top: min_y,
      width: max_x - min_x,
      height: max_y - min_y,
    };
  };

  const getDrawElement = (): DrawElement | undefined => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    const rect = getRect();
    if (rect.width < 10 && rect.height < 10) return undefined;

    const newElement: DrawElement = {
      rect: rect,
      imageData: ctx.getImageData(
        rect.left,
        rect.top,
        Math.max(1, rect.width),
        Math.max(1, rect.height)
      ),
      pickingColor: {
        r: currentPickColor.r,
        g: currentPickColor.g,
        b: currentPickColor.b,
        a: currentPickColor.a,
      },
      isSelect: false,
      usedTool: tool,
    };
    return newElement;
  };

  const getPickingElement = (): PickingElement | undefined => {
    const rect = getRect();
    if (rect.width < 10 && rect.height < 10) return undefined;

    const newPickingElement: PickingElement = {
      rect: rect,
      pickImage: new Image(),
    };

    newPickingElement.pickImage.width = newPickingElement.rect.width;
    newPickingElement.pickImage.height = newPickingElement.rect.height;
    newPickingElement.pickImage.src = pickingCanvas.current?.toDataURL()
      ? pickingCanvas.current?.toDataURL()
      : "";

    return newPickingElement;
  };

  const selectElement = (x: number, y: number) => {
    const ctx = pickingCanvas.current?.getContext("2d");
    if (ctx) {
      const pickColor = ctx.getImageData(x, y, 1, 1).data;

      const newDrawElements = drawElements.map((element) => {
        element.isSelect =
          element.pickingColor.r === pickColor[0] &&
          element.pickingColor.g === pickColor[1] &&
          element.pickingColor.b === pickColor[2];

        return element;
      });
      setDrawElements(newDrawElements);
    }
  };

  const updatePickingCanvas = () => {
    if (pickingContext) {
      pickingElements.forEach((element) => {
        pickingContext.drawImage(element.pickImage, 0, 0);
      });
      requestAnimationFrame(updatePickingCanvas);
    }
  };

  useEffect(() => {
    if (pickingCanvas.current)
      pickingCanvas.current.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize); // fixme : resize시 drawelement 위치가 변함
    window.addEventListener("load", onResize); // fixme : resize시 drawelement 위치가 변함
    return () => {
      if (pickingCanvas.current)
        pickingCanvas.current.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, []);

  useEffect(() => {
    drawElement(mainContext);
    drawElement(pickingContext);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [currentSite, isDrag]);

  useEffect(() => {
    updatePickingCanvas();
  }, [pickingElements.length]);

  useEffect(() => {
    setMainContext(mainCanvas.current?.getContext("2d") || undefined);
  }, [mainCanvas]);

  useEffect(() => {
    setPickingContext(pickingCanvas.current?.getContext("2d") || undefined);
  }, [pickingCanvas]);

  return (
    <>
      <div className="board">
        {drawElements.map((element) => {
          return <DrawElementCanvas el={element} />;
        })}
        <div className="canvas_container">
          <canvas className="main_canvas" ref={mainCanvas}></canvas>
          <canvas className="picking_canvas" ref={pickingCanvas}></canvas>
        </div>
      </div>
    </>
  );
};

export default Board;
