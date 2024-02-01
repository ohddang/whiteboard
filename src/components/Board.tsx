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

  const [path, setPath] = useState<Array<Site>>([]);
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
    if (
      getTool() === ToolType.RECT ||
      getTool() === ToolType.ARROW ||
      getTool() === ToolType.TEXT
    ) {
      console.log("onMouseDown");
      path.push([e.pageX, e.pageY]);
      path.push([e.pageX, e.pageY]);

      setPath(path);
      setIsDrag(true);

      // set current color picking key
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const a = 1;

      if (currentPickColor !== undefined) {
        currentPickColor.r = r;
        currentPickColor.g = g;
        currentPickColor.b = b;
        currentPickColor.a = a;
      }

      setCurrentPickColor(currentPickColor);
    }

    // color picking
    if (getTool() === ToolType.SELECT) selectElement(e.pageX, e.pageY);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (getTool() === ToolType.RECT || getTool() === ToolType.ARROW) {
      if (isDrag) {
        path.push([e.pageX, e.pageY]);
        setPath(path);
        setCurrentSite([e.pageX, e.pageY]);
      }
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    if (getTool() === ToolType.RECT || getTool() === ToolType.ARROW) {
      setIsDrag(false);
      updateDrawElements();
      updatePickingElements();

      path.splice(0, path.length);
      setPath(path);

      if (mainContext)
        mainContext.clearRect(
          0,
          0,
          mainContext.canvas.width,
          mainContext.canvas.height
        );
    }
  };

  const onResize = (e: UIEvent) => {
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

  const onLoad = (e: Event) => {
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

  const drawElement = (): void => {
    if (path.length <= 1) return;

    if (mainContext) {
      mainContext.strokeStyle = "#ca5";
      mainContext.lineWidth = 5;

      mainContext.beginPath();
      mainContext.moveTo(path[0][0], path[0][1]);

      path.forEach((pos) => {
        mainContext.lineTo(pos[0], pos[1]);
      });
      mainContext.stroke();
    }
  };

  const drawPickingElement = (): void => {
    if (path.length <= 1) return;

    if (pickingContext) {
      pickingContext.strokeStyle = `rgba(${currentPickColor?.r}, ${currentPickColor?.g}, ${currentPickColor?.b}, ${currentPickColor?.a})`;
      pickingContext.lineWidth = 15;

      pickingContext.beginPath();
      pickingContext.moveTo(path[0][0], path[0][1]);

      path.forEach((pos) => {
        pickingContext.lineTo(pos[0], pos[1]);
      });
      pickingContext.stroke();
    }
  };

  const updateDrawElements = (): void => {
    const newElement = getDrawElement();
    if (newElement) {
      drawElements.push(newElement);
      setDrawElements(drawElements);
    }
  };

  const updatePickingElements = (): void => {
    const newPickElement = getPickingElement();
    pickingElements.push(newPickElement);
    setPickingElements(pickingElements);
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

    // line width 만큼 영역 확장
    min_x -= 5;
    min_y -= 5;
    max_x += 5;
    max_y += 5;

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

  const getPickingElement = (): PickingElement => {
    const newPickingElement: PickingElement = {
      rect: getRect(),
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
        if (
          element.pickingColor.r === pickColor[0] &&
          element.pickingColor.g === pickColor[1] &&
          element.pickingColor.b === pickColor[2]
        ) {
          element.isSelect = true;
        } else {
          element.isSelect = false;
        }
        return element;
      });
      setDrawElements(newDrawElements);
    }
  };

  const updatePickingCanvas = () => {
    if (pickingContext) {
      pickingContext.clearRect(
        0,
        0,
        pickingContext.canvas.width,
        pickingContext.canvas.height
      );

      pickingElements.forEach((element) => {
        pickingContext.drawImage(element.pickImage, 0, 0);
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    drawElement();
    drawPickingElement();
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
    setPickingContext(pickingCanvas.current?.getContext("2d") || undefined);
  }, [mainCanvas, pickingCanvas]);

  console.log("drawElements", drawElements.length);

  return (
    <>
      <div className="board">
        {drawElements.map((element) => {
          console.log("drawElement", element.isSelect);
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
