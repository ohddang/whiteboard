import "./drawElement.scss";

import { useState, useEffect, useRef } from "react";
import { Site, Rect, DrawElement, PickingElement, Color, ToolType, TransformToolType } from "../type/common";
import DrawElementCanvas from "./DrawElementCanvas";
import {
  useSelectedToolStore,
  useSelectionLayoutStyle,
  useSelectionTextScrollSize,
  useTransformToolStore,
} from "../store/store";

import { showLog } from "../utils/showLog";

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
  const [pickingContext, setPickingContext] = useState<CanvasRenderingContext2D>();
  const [pickingDrawContext, setPickingDrawContext] = useState<CanvasRenderingContext2D>();

  const [path, setPath] = useState<Site[]>([]); // FIXME : [] -> start, end
  const [isDrag, setIsDrag] = useState<boolean>(false);

  const [drawElements, setDrawElements] = useState<DrawElement[]>([]);
  const [pickingElements, setPickingElements] = useState<PickingElement[]>([]);

  const [currentSite, setCurrentSite] = useState<Site>({ x: 0, y: 0 });

  const { tool, setTool, getTool } = useSelectedToolStore();
  const { getStyle } = useSelectionLayoutStyle();
  const { getScrollSize } = useSelectionTextScrollSize();
  const { setTransformTool, getTransformTool } = useTransformToolStore();

  const isTriggerRef = useRef<boolean>(false);

  const onMouseDown = (e: MouseEvent) => {
    path.splice(0, path.length);

    switch (getTool()) {
      case ToolType.RECT:
      case ToolType.ARROW:
        unselectAllElement();
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
      case ToolType.TEXT:
        unselectAllElement();
        if (pickingColorRef !== undefined) {
          pickingColorRef.current.r = Math.floor(Math.random() * 255);
          pickingColorRef.current.g = Math.floor(Math.random() * 255);
          pickingColorRef.current.b = Math.floor(Math.random() * 255);
          pickingColorRef.current.a = 1;
        }

        path.push({ x: e.pageX, y: e.pageY });
        path.push({ x: e.pageX + 100, y: e.pageY + 50 });
        addDrawElements();
        addPickingElements();
        break;
      case ToolType.SELECT:
      case ToolType.MOVE:
        if (isDrag === false) {
          selectElement(e.pageX, e.pageY);
          path.push({ x: e.pageX, y: e.pageY });
          setPath(path);
        }
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
          if (Math.abs(path[0].x - e.pageX) < 10 && Math.abs(path[0].y - e.pageY) < 10) return;

          if (path.length > 1) path.pop();

          path.push({ x: e.pageX, y: e.pageY });
          setPath(path);
        }
        break;
      case ToolType.MOVE:
      case ToolType.SELECT:
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
          const deltaX = e.pageX - currentSite.x;
          const deltaY = e.pageY - currentSite.y;
          scaleSelectElement(deltaX, deltaY, transformTool);
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
      addDrawElements();
      addPickingElements();

      if (mainContext) {
        mainContext.clearRect(0, 0, mainContext.canvas.width, mainContext.canvas.height);
      }
    }
    if (getTool() === ToolType.MOVE || getTool() === ToolType.SELECT) {
      setIsDrag(false);
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
        element.translate.x += dx;
        element.translate.y += dy;
      }
      return element;
    });
    setDrawElements(newDrawElements);
  };

  const rotateSelectElement = (mouseX: number, mouseY: number, deltaX: number, deltaY: number) => {
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

  const calculateScale = (element: DrawElement, deltaX: number, deltaY: number) => {
    if ((element.scale.x + deltaX) * element.rect.width < 40) return false;
    if ((element.scale.y + deltaY) * element.rect.height < 40) return false;
    return true;
  };

  const scaleSelectElement = (deltaX: number, deltaY: number, tool: TransformToolType) => {
    const newDrawElements = drawElements.map((element) => {
      if (element.isSelect) {
        if (selectionLayoutRef.current) {
          const rect = selectionLayoutRef.current.getBoundingClientRect();

          let radian = -element.rotate * (Math.PI / 180);
          let dx = deltaX * Math.cos(radian) - deltaY * Math.sin(radian);
          let dy = deltaX * Math.sin(radian) + deltaY * Math.cos(radian);
          let scaledx = (dx / rect.width) * 2 * element.scale.x;
          let scaledy = (dy / rect.height) * 2 * element.scale.y;
          switch (tool) {
            case TransformToolType.SCALE_1:
              if (calculateScale(element, scaledx * -1, scaledy * -1)) {
                element.scale.x += scaledx * -1;
                element.scale.y += scaledy * -1;
              }
              break;
            case TransformToolType.SCALE_2:
              if (calculateScale(element, 0, scaledy * -1)) {
                element.scale.y += scaledy * -1;
              }
              break;
            case TransformToolType.SCALE_3:
              if (calculateScale(element, scaledx, scaledy * -1)) {
                element.scale.x += scaledx;
                element.scale.y += scaledy * -1;
              }
              break;
            case TransformToolType.SCALE_4:
              if (calculateScale(element, scaledx * -1, 0)) {
                element.scale.x += scaledx * -1;
              }
              break;
            case TransformToolType.SCALE_5:
              if (calculateScale(element, scaledx, 0)) {
                element.scale.x += scaledx;
              }
              break;
            case TransformToolType.SCALE_6:
              if (calculateScale(element, scaledx * -1, scaledy)) {
                element.scale.x += scaledx * -1;
                element.scale.y += scaledy;
              }
              break;
            case TransformToolType.SCALE_7:
              if (calculateScale(element, 0, scaledy)) {
                element.scale.y += scaledy;
              }
              break;
            case TransformToolType.SCALE_8:
              if (calculateScale(element, scaledx, scaledy)) {
                element.scale.x += scaledx;
                element.scale.y += scaledy;
              }
              break;
          }

          // TODO : drawElementCanvas에서 canvas렌더링 방식 변경 image -> canvas에서 그리도록 변경 검토
          //        pickingElement도 redraw하도록 변경
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
          element.translate.x = findElement.translate.x;
          element.translate.y = findElement.translate.y;
          element.rotate = findElement.rotate;
          element.scale.x = findElement.scale.x;
          element.scale.y = findElement.scale.y;
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
      width: max_x - min_x,
      height: max_y - min_y,
    };
  };

  const getDrawElement = (): DrawElement | undefined => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (!ctx) {
      return undefined;
    }
    const tool = getTool();
    const rect = getRect();
    if ((tool === ToolType.RECT || tool === ToolType.ARROW) && rect.width < 10 && rect.height < 10) return undefined;

    const newElement: DrawElement = {
      rect: rect,
      pickingColor: {
        r: pickingColorRef.current.r,
        g: pickingColorRef.current.g,
        b: pickingColorRef.current.b,
        a: pickingColorRef.current.a,
      },
      translate: { x: rect.left, y: rect.top }, // 수정
      rotate: 0,
      scale: { x: 1, y: 1 },

      isSelect: false,
      usedTool: tool,
    };
    if (tool === ToolType.RECT || tool === ToolType.ARROW)
      newElement.imageData = ctx.getImageData(rect.left, rect.top, Math.max(1, rect.width), Math.max(1, rect.height));

    return newElement;
  };

  const getPickingElement = (): PickingElement | undefined => {
    const rect = getRect();
    const tool = getTool();
    if ((tool === ToolType.RECT || tool === ToolType.ARROW) && rect.width < 10 && rect.height < 10) return undefined;

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
      usedTool: tool,
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

  const unselectAllElement = () => {
    const newDrawElements = drawElements.map((element) => {
      element.isSelect = false;
      return element;
    });
    isSelectRef.current = false;
    setDrawElements(newDrawElements);
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
      pickingContext.clearRect(0, 0, pickingContext.canvas.width, pickingContext.canvas.height);

      pickingElements.forEach((element) => {
        pickingContext.save();
        pickingContext.translate(
          element.translate.x + element.rect.width / 2,
          element.translate.y + element.rect.height / 2
        );
        pickingContext.rotate(element.rotate * (Math.PI / 180));
        pickingContext.scale(element.scale.x, element.scale.y);

        if (ToolType.RECT === element.usedTool || ToolType.ARROW === element.usedTool) {
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
        } else if (ToolType.TEXT === element.usedTool) {
          pickingContext.fillStyle = `rgba(${element.pickingColor.r},${element.pickingColor.g},${element.pickingColor.b},${element.pickingColor.a})`;
          pickingContext.fillRect(
            -element.rect.width / 2,
            -element.rect.height / 2,
            element.rect.width,
            element.rect.height
          );
        }

        pickingContext.restore();
      });
    }
  };

  const onTransformTool = (event: React.MouseEvent<HTMLDivElement>, tool: TransformToolType): void => {
    event.stopPropagation();
    if (getTransformTool() === TransformToolType.NONE) setTransformTool(tool);
  };

  const selectionLayoutStyle = getStyle();
  if (selectionLayoutRef.current) {
    selectionLayoutRef.current.style.width = `${selectionLayoutStyle.width * selectionLayoutStyle.scale.x}px`;
    selectionLayoutRef.current.style.height = `${selectionLayoutStyle.height * selectionLayoutStyle.scale.y}px`;
    selectionLayoutRef.current.style.transform = selectionLayoutStyle.transform;
    selectionLayoutRef.current.style.left = `${
      (selectionLayoutStyle.width - selectionLayoutStyle.width * selectionLayoutStyle.scale.x) / 2
    }px`;
    selectionLayoutRef.current.style.top = `${
      (selectionLayoutStyle.height - selectionLayoutStyle.height * selectionLayoutStyle.scale.y) / 2
    }px`;
  }

  const appendTextScrollSize = getScrollSize();

  useEffect(() => {
    if (selectionLayoutRef.current) {
      const newDrawElements = drawElements.map((element) => {
        if (element.usedTool === ToolType.TEXT) {
          if (
            element.pickingColor.r === appendTextScrollSize.color.r &&
            element.pickingColor.g === appendTextScrollSize.color.g &&
            element.pickingColor.b === appendTextScrollSize.color.b
          ) {
            element.rect.width = appendTextScrollSize.width;
            element.rect.height = appendTextScrollSize.height;
          }
        }
        return element;
      });
      setDrawElements(newDrawElements);
    }
  }, [appendTextScrollSize]);

  useEffect(() => {
    if (selectionLayoutRef.current) {
      selectionLayoutRef.current.addEventListener("mousedown", onMouseDown);
    }
  }, [selectionLayoutRef.current]);

  useEffect(() => {
    transformPickingElements();
  }, [isTriggerRef.current, drawElements]);

  useEffect(() => {
    if (pickingCanvas.current) {
      pickingCanvas.current.addEventListener("mousedown", onMouseDown);
    }

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    return () => {
      if (pickingCanvas.current) pickingCanvas.current.removeEventListener("mousedown", onMouseDown);
      if (selectionLayoutRef.current) selectionLayoutRef.current.removeEventListener("mousedown", onMouseDown);
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
    requestAnimationFrame(updatePickingCanvas); // log utils
  }, [pickingElements, pickingElements.length]);

  useEffect(() => {
    setMainContext(mainCanvas.current?.getContext("2d") || ({} as CanvasRenderingContext2D));
    setPickingContext(pickingCanvas.current?.getContext("2d") || ({} as CanvasRenderingContext2D));
    setPickingDrawContext(pickingDrawCanvas.current?.getContext("2d") || ({} as CanvasRenderingContext2D));
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
          <canvas id="selected_canvas" className="picking_canvas" ref={pickingCanvas}></canvas>
          {isSelectRef.current && (
            <div
              className="selection_layout"
              ref={selectionLayoutRef}
              onMouseDown={(event) => onTransformTool(event, TransformToolType.MOVE)}>
              <div className="transform_tool_container" id="transform_tool_container">
                <div
                  className="scale_tool_1"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_1)}></div>
                <div
                  className="scale_tool_2"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_2)}></div>
                <div
                  className="scale_tool_3"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_3)}></div>
                <div
                  className="scale_tool_4"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_4)}></div>
                <div
                  className="scale_tool_5"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_5)}></div>
                <div
                  className="scale_tool_6"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_6)}></div>
                <div
                  className="scale_tool_7"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_7)}></div>
                <div
                  className="scale_tool_8"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.SCALE_8)}></div>
                <div
                  className="rotate_tool"
                  onMouseDown={(event) => onTransformTool(event, TransformToolType.ROTATE)}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Board;
