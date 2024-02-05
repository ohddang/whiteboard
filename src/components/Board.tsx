import "./drawElement.scss";

import { useState, useEffect, useRef } from "react";
import {
  Site,
  Rect,
  DrawElement,
  PickingElement,
  Color,
  ToolType,
  TransformToolType,
} from "../type/common";
import DrawElementCanvas from "./DrawElementCanvas";
import {
  useSelectedToolStore,
  useSelectionLayoutStyle,
  useTransformToolStore,
} from "../store/store";

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
  const { setTransformTool, getTransformTool } = useTransformToolStore();

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
    setIsDrag(true);
    setCurrentSite({ x: e.pageX, y: e.pageY });
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
        }
        break;
      case ToolType.MOVE:
        break;
      default:
        break;
    }

    const transformTool = getTransformTool();
    switch (transformTool) {
      case TransformToolType.MOVE:
        if (isDrag) {
          if (path && path.length > 1) {
            const prePosition: Site | undefined = path.pop();
            if (prePosition === undefined) return;

            const moveX = e.pageX - prePosition.x;
            const moveY = e.pageY - prePosition.y;
            translateSelectElement(moveX, moveY);
          }
          path.push({ x: e.pageX, y: e.pageY });
          setPath(path);
        }
        break;
      case TransformToolType.ROTATE:
        if (isDrag) {
          const deltaX = (e.pageX - currentSite.x) * 0.2;
          const deltaY = (e.pageY - currentSite.y) * 0.2;
          rotateSelectElement(e.pageX, e.pageY, deltaX, deltaY);
        }
        break;
      case TransformToolType.SCALE_1:
      case TransformToolType.SCALE_2:
      case TransformToolType.SCALE_3:
      case TransformToolType.SCALE_4:
      case TransformToolType.SCALE_5:
      case TransformToolType.SCALE_6:
      case TransformToolType.SCALE_7:
      case TransformToolType.SCALE_8:
        if (isDrag) {
          scaleSelectElement(e.pageX, e.pageY, transformTool);
        }
        break;
      default:
        break;
    }

    setCurrentSite({ x: e.pageX, y: e.pageY });
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
    setTransformTool(TransformToolType.NONE);
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

  const translateSelectElement = (dx: number, dy: number) => {
    const newDrawElements = drawElements.map((element) => {
      if (element.isSelect) {
        element.rect.left += dx;
        element.rect.top += dy;
      }
      return element;
    });
    setDrawElements(newDrawElements);
  };

  const rotateSelectElement = (
    mouseX: number,
    mouseY: number,
    deltaX: number,
    deltaY: number
  ) => {
    const newDrawElements = drawElements.map((element) => {
      if (element.isSelect) {
        if (selectionLayoutRef.current) {
          const rect = selectionLayoutRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          let dx = deltaX;
          let dy = deltaY;
          if (mouseY > centerY) dx *= -1;
          if (mouseX < centerX) dy *= -1;

          const angle = dx + dy;

          element.rotate += angle;
        }
      }
      return element;
    });
    setDrawElements(newDrawElements);
  };

  const scaleSelectElement = (
    pageX: number,
    pageY: number,
    tool: TransformToolType
  ) => {
    const newDrawElements = drawElements.map((element) => {
      if (element.isSelect) {
        if (selectionLayoutRef.current) {
          let px = pageX;
          let py = pageY;
          switch (tool) {
            case TransformToolType.SCALE_1:
              element.rect.left = px;
              element.rect.top = py;
              element.rect.width = element.rect.right - element.rect.left;
              element.rect.height = element.rect.bottom - element.rect.top;
              break;
            case TransformToolType.SCALE_2:
              element.rect.top = py;
              element.rect.height = element.rect.bottom - element.rect.top;
              break;
            case TransformToolType.SCALE_3:
              element.rect.top = py;
              element.rect.right = px;
              element.rect.width = element.rect.right - element.rect.left;
              element.rect.height = element.rect.bottom - element.rect.top;
              break;
            case TransformToolType.SCALE_4:
              element.rect.left = px;
              element.rect.width = element.rect.right - element.rect.left;
              break;
            case TransformToolType.SCALE_5:
              element.rect.right = px;
              element.rect.width = element.rect.right - element.rect.left;
              break;
            case TransformToolType.SCALE_6:
              element.rect.left = px;
              element.rect.bottom = py;
              element.rect.width = element.rect.right - element.rect.left;
              element.rect.height = element.rect.bottom - element.rect.top;
              break;
            case TransformToolType.SCALE_7:
              element.rect.bottom = py;
              element.rect.height = element.rect.bottom - element.rect.top;
              break;
            case TransformToolType.SCALE_8:
              element.rect.right = px;
              element.rect.bottom = py;
              element.rect.width = element.rect.right - element.rect.left;
              element.rect.height = element.rect.bottom - element.rect.top;
              break;
          }
          // TODO : scale 변경 시 redraw... 도형의 두점을 저장.. minx, miny, maxx, maxy 조합으로.. 저장
          // ex) (minx, maxy) (maxx, miny) 이런식으로 저장하고 scale 변경 시 이 두점을 기준으로 다시 그리기
        }
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
          element.rotate = findElement.rotate;
          element.scale.x = findElement.scale.x;
          element.scale.y = findElement.scale.y;
          element.transformOrigin.x = findElement.transformOrigin.x;
          element.transformOrigin.y = findElement.transformOrigin.y;
          element.rect.width = findElement.rect.width;
          element.rect.height = findElement.rect.height;
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
      right: max_x,
      bottom: max_y,
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
      translate: { x: 0, y: 0 },
      rotate: 0,
      scale: { x: 1, y: 1 },
      transformOrigin: { x: 0, y: 0 },

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
      rotate: 0,
      scale: { x: 1, y: 1 },
      transformOrigin: { x: 0, y: 0 },
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
        pickingContext.rotate(element.rotate * (Math.PI / 180));

        pickingContext.translate(
          element.transformOrigin.x,
          element.transformOrigin.y
        );

        pickingContext.scale(element.scale.x, element.scale.y);

        pickingContext.translate(
          -element.transformOrigin.x,
          -element.transformOrigin.y
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

  const onTransformTool = (
    event: React.MouseEvent<HTMLDivElement>,
    tool: TransformToolType
  ): void => {
    event.stopPropagation();
    if (getTransformTool() === TransformToolType.NONE) setTransformTool(tool);
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
            <div
              className="selection_layout"
              ref={selectionLayoutRef}
              onMouseDown={(event) =>
                onTransformTool(event, TransformToolType.MOVE)
              }
            >
              <div
                className="transform_tool_container"
                id="transform_tool_container"
              >
                <div
                  className="scale_tool_1"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_1)
                  }
                ></div>
                <div
                  className="scale_tool_2"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_2)
                  }
                ></div>
                <div
                  className="scale_tool_3"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_3)
                  }
                ></div>
                <div
                  className="scale_tool_4"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_4)
                  }
                ></div>
                <div
                  className="scale_tool_5"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_5)
                  }
                ></div>
                <div
                  className="scale_tool_6"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_6)
                  }
                ></div>
                <div
                  className="scale_tool_7"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_7)
                  }
                ></div>
                <div
                  className="scale_tool_8"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.SCALE_8)
                  }
                ></div>
                <div
                  className="rotate_tool"
                  onMouseDown={(event) =>
                    onTransformTool(event, TransformToolType.ROTATE)
                  }
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Board;
