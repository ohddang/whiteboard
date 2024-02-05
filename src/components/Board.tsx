import "./drawElement.scss";

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
import { useSelectedToolStore, useSelectionLayoutStyle } from "../store/store";
import select from "/assets/select.svg";

const Board: React.FC = () => {
  const mainCanvas = useRef<HTMLCanvasElement>(null);
  const pickingCanvas = useRef<HTMLCanvasElement>(null);
  const pickingDrawCanvas = useRef<HTMLCanvasElement>(null);

  const selectionLayoutRef = useRef<HTMLDivElement>(null);
  const pickingColorRef = useRef<Color>({
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  });
  const isSelectRef = useRef<boolean>(false);

  const [mainContext, setMainContext] = useState<CanvasRenderingContext2D>();
  const [pickingContext, setPickingContext] =
    useState<CanvasRenderingContext2D>();
  const [pickingDrawContext, setPickingDrawContext] =
    useState<CanvasRenderingContext2D>();

  const [path, setPath] = useState<Site[]>([]); // FIXME : [] -> start, end
  const [isDrag, setIsDrag] = useState<boolean>(false);

  const [drawElements, setDrawElements] = useState<DrawElement[]>([]);
  const [pickingElements, setPickingElements] = useState<PickingElement[]>([]);

  const [currentSite, setCurrentSite] = useState<Site>({ x: 0, y: 0 });

  const { tool, setTool, getTool } = useSelectedToolStore();
  const { getStyle } = useSelectionLayoutStyle();

  const onMouseDown = (e: MouseEvent) => {
    switch (getTool()) {
      case ToolType.RECT:
      case ToolType.ARROW:
      case ToolType.TEXT:
        path.push({ x: e.pageX, y: e.pageY });
        setPath(path);
        if (pickingColorRef !== undefined) {
          setIsDrag(true);
          pickingColorRef.current.r = Math.floor(Math.random() * 255);
          pickingColorRef.current.g = Math.floor(Math.random() * 255);
          pickingColorRef.current.b = Math.floor(Math.random() * 255);
          pickingColorRef.current.a = 1;
        }
        break;
      case ToolType.SELECT:
        selectElement(e.pageX, e.pageY);
        break;
      case ToolType.MOVE:
        setIsDrag(true);
        path.push({ x: e.pageX, y: e.pageY });
        setPath(path);

        break;
      default:
        break;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    const tool = getTool();
    switch (tool) {
      case ToolType.RECT:
      case ToolType.ARROW:
        if (isDrag) {
          if (
            Math.abs(path[0].x - e.pageX) < 10 &&
            Math.abs(path[0].y - e.pageY) < 10
          )
            return;

          if (path.length > 1) path.pop();

          path.push({ x: e.pageX, y: e.pageY });
          setPath(path);
          setCurrentSite({ x: e.pageX, y: e.pageY });
        }
        break;
      case ToolType.MOVE:
        if (isDrag) {
          if (path && path.length > 1) {
            const prePosition: Site | undefined = path.pop();
            if (prePosition === undefined) return;

            const moveX = e.pageX - prePosition.x;
            const moveY = e.pageY - prePosition.y;
            transformSelectElement(moveX, moveY);
          }
          path.push({ x: e.pageX, y: e.pageY });
          setPath(path);
          setCurrentSite({ x: e.pageX, y: e.pageY });
        }
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

      if (mainContext) {
        mainContext.clearRect(
          0,
          0,
          mainContext.canvas.width,
          mainContext.canvas.height
        );
      }
    }
    if (getTool() === ToolType.MOVE || getTool() === ToolType.SELECT) {
      setIsDrag(false);
      transformPickingElements();
    }
    path.splice(0, path.length);
    setPath(path);
  };

  const onResize = (e: any) => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
    }
    const pCtx = pickingCanvas.current?.getContext("2d");
    if (pCtx) {
      pCtx.canvas.width = window.innerWidth;
      pCtx.canvas.height = window.innerHeight;
    }
    const pdCtx = pickingDrawCanvas.current?.getContext("2d");
    if (pdCtx) {
      pdCtx.canvas.width = window.innerWidth;
      pdCtx.canvas.height = window.innerHeight;
    }
  };

  const transformSelectElement = (x: number, y: number) => {
    const newDrawElements = drawElements.map((element) => {
      if (element.isSelect) {
        element.rect.left += x;
        element.rect.top += y;
      }
      return element;
    });
    setDrawElements(newDrawElements);
  };

  const transformPickingElements = () => {
    const newPickingElements = pickingElements.map((element) => {
      if (
        element.pickingColor.r === pickingColorRef.current.r &&
        element.pickingColor.g === pickingColorRef.current.g &&
        element.pickingColor.b === pickingColorRef.current.b
      ) {
        const findElement = drawElements.find((el) => el.isSelect === true);
        if (findElement) {
          element.translate.x = findElement.rect.left;
          element.translate.y = findElement.rect.top;
        }
      }
      return element;
    });
    setPickingElements(newPickingElements);
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
      if (pos.x > max_x) max_x = pos.x;
      if (pos.x < min_x) min_x = pos.x;
      if (pos.y > max_y) max_y = pos.y;
      if (pos.y < min_y) min_y = pos.y;
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
        r: pickingColorRef.current.r,
        g: pickingColorRef.current.g,
        b: pickingColorRef.current.b,
        a: pickingColorRef.current.a,
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
      pickingColor: {
        r: pickingColorRef.current.r,
        g: pickingColorRef.current.g,
        b: pickingColorRef.current.b,
        a: pickingColorRef.current.a,
      },

      translate: { x: rect.left, y: rect.top },
    };

    newPickingElement.pickImage.width = newPickingElement.rect.width;
    newPickingElement.pickImage.height = newPickingElement.rect.height;
    newPickingElement.pickImage.src = pickingDrawCanvas.current?.toDataURL()
      ? pickingDrawCanvas.current?.toDataURL()
      : "";

    return newPickingElement;
  };

  const selectElement = (x: number, y: number) => {
    const ctx = pickingCanvas.current?.getContext("2d");
    if (ctx) {
      const pickColor = ctx.getImageData(x, y, 1, 1).data;
      pickingColorRef.current.r = pickColor[0];
      pickingColorRef.current.g = pickColor[1];
      pickingColorRef.current.b = pickColor[2];
      pickingColorRef.current.a = pickColor[3];

      let isSelect = false;
      const newDrawElements = drawElements.map((element) => {
        element.isSelect =
          element.pickingColor.r === pickColor[0] &&
          element.pickingColor.g === pickColor[1] &&
          element.pickingColor.b === pickColor[2];

        if (element.isSelect) isSelect = true;
        return element;
      });
      isSelectRef.current = isSelect;
      setDrawElements(newDrawElements);
    }
  };

  const drawElement = (context: CanvasRenderingContext2D | undefined): void => {
    context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (path.length <= 1) return;

    if (context) {
      if (context === mainContext) {
        context.strokeStyle = "#ca5";
        context.lineWidth = 10;
      } else if (context === pickingDrawContext) {
        context.strokeStyle = `rgba(${pickingColorRef.current?.r}, ${pickingColorRef.current?.g}, ${pickingColorRef.current?.b}, ${pickingColorRef.current?.a})`;
        context.lineWidth = 10;
      }

      const rect = getRect();
      context.beginPath();
      switch (getTool()) {
        case ToolType.RECT:
          context.rect(rect.left, rect.top, rect.width, rect.height);
          break;
        case ToolType.ARROW:
          context.moveTo(path[0].x, path[0].y);
          path.forEach((pos) => {
            context.lineTo(pos.x, pos.y);
          });
          break;
      }
      context.stroke();
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
        pickingContext.save();
        pickingContext.translate(
          element.translate.x + element.rect.width / 2,
          element.translate.y + element.rect.height / 2
        );
        pickingContext.rotate(15 * (Math.PI / 180));

        pickingContext.translate(
          -element.rect.width / 2,
          -element.rect.height / 2
        );

        const scale = 1.2;
        pickingContext.scale(scale, scale);

        pickingContext.translate(
          element.rect.width / 2,
          element.rect.height / 2
        );

        pickingContext.drawImage(
          element.pickImage,
          element.rect.left,
          element.rect.top,
          element.rect.width,
          element.rect.height,
          -(element.rect.width / 2),
          -(element.rect.height / 2),
          element.rect.width,
          element.rect.height
        );

        pickingContext.restore();
      });
    }
  };

  const selectionLayoutStyle = getStyle();
  if (selectionLayoutRef.current) {
    selectionLayoutRef.current.style.width = selectionLayoutStyle.width;
    selectionLayoutRef.current.style.height = selectionLayoutStyle.height;
    selectionLayoutRef.current.style.transform = selectionLayoutStyle.transform;
  }

  useEffect(() => {
    if (selectionLayoutRef.current) {
      selectionLayoutRef.current.addEventListener("mousedown", onMouseDown);
    }
  }, [selectionLayoutRef.current]);

  useEffect(() => {
    if (pickingCanvas.current) {
      pickingCanvas.current.addEventListener("mousedown", onMouseDown);
    }
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    return () => {
      if (pickingCanvas.current)
        pickingCanvas.current.removeEventListener("mousedown", onMouseDown);
      if (selectionLayoutRef.current)
        selectionLayoutRef.current.removeEventListener(
          "mousedown",
          onMouseDown
        );
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, []);

  useEffect(() => {
    drawElement(mainContext);
    drawElement(pickingDrawContext);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [currentSite, isDrag]);

  useEffect(() => {
    updatePickingCanvas();
    requestAnimationFrame(updatePickingCanvas);
  }, [isDrag, pickingElements]);

  useEffect(() => {
    setMainContext(
      mainCanvas.current?.getContext("2d") || ({} as CanvasRenderingContext2D)
    );
    setPickingContext(
      pickingCanvas.current?.getContext("2d") ||
        ({} as CanvasRenderingContext2D)
    );
    setPickingDrawContext(
      pickingDrawCanvas.current?.getContext("2d") ||
        ({} as CanvasRenderingContext2D)
    );
  }, []);

  useEffect(() => {
    setIsDrag(false);
  }, [tool]);

  return (
    <>
      <div className="board">
        {drawElements.map((element) => {
          return <DrawElementCanvas el={element} />;
        })}
        <div className="canvas_container">
          <canvas className="picking_canvas" ref={pickingDrawCanvas}></canvas>
          <canvas className="main_canvas" ref={mainCanvas}></canvas>
          <canvas
            id="selected_canvas"
            className="picking_canvas"
            ref={pickingCanvas}
          ></canvas>
          {isSelectRef.current && (
            <div className="selection_layout" ref={selectionLayoutRef}>
              <div className="transform_tool_container">
                <div className="scale_tool_1"></div>
                <div className="scale_tool_2"></div>
                <div className="scale_tool_3"></div>
                <div className="scale_tool_4"></div>
                <div className="scale_tool_5"></div>
                <div className="scale_tool_6"></div>
                <div className="scale_tool_7"></div>
                <div className="scale_tool_8"></div>
                <div className="rotate_tool"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Board;
