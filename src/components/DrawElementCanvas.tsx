import "./drawElement.scss";
import { useState, useEffect, useRef } from "react";
import { DrawElement, ToolType } from "../type/common";
import { useSelectionLayoutStyle, useSelectionTextScrollSize } from "../store/store";
import { showLog } from "../utils/showLog";
import arrow from "/assets/arrow.svg";

const DrawElementCanvas: React.FC<{ el: DrawElement }> = ({ el }: { el: DrawElement }) => {
  const [textScroll, setTextScroll] = useState<{ width: number; height: number }>({ width: 100, height: 50 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const arrowRef = useRef<HTMLImageElement>(null);
  const { setStyle } = useSelectionLayoutStyle();
  const { setScrollSize } = useSelectionTextScrollSize();

  const onBlurRef = useRef<boolean>(false);

  const onChangeTextarea: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    if (textareaRef.current === null) return;

    setTextScroll({
      width: textareaRef.current.scrollWidth,
      height: textareaRef.current.scrollHeight,
    });
    setScrollSize({
      width: textareaRef.current.scrollWidth,
      height: textareaRef.current.scrollHeight,
      color: el.pickingColor,
    });
  };

  const onBlurTextarea: React.FocusEventHandler<HTMLTextAreaElement> = (event) => {
    if (textareaRef.current === null) return;

    textareaRef.current.style.width = `${1}px`;
    onBlurRef.current = true;
  };

  useEffect(() => {
    if (textareaRef.current !== null && onBlurRef.current) {
      textareaRef.current.style.width = `${Number(textareaRef.current.style.width) + 2}px`;

      setTextScroll({
        width: textareaRef.current.scrollWidth,
        height: textareaRef.current.scrollHeight,
      });
      setScrollSize({
        width: textareaRef.current.scrollWidth,
        height: textareaRef.current.scrollHeight,
        color: el.pickingColor,
      });

      onBlurRef.current = false;
    }
  }, [onBlurRef.current]);

  useEffect(() => {
    const translate = `translate(${el.translate.x}px, ${el.translate.y}px)`;
    const rotate = `rotate(${el.rotate}deg)`;
    const scale = `scale(${el.scale.x}, ${el.scale.y})`;

    let width = 0;
    let height = 0;

    if (el.usedTool === ToolType.RECT || el.usedTool === ToolType.ARROW) {
      if (canvasRef.current === null) return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      if (el.imageData === undefined) return;

      width = el.rect.width;
      height = el.rect.height;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      canvasRef.current.style.transform = `${translate} ${rotate} ${scale}`;

      if (ctx) {
        ctx.strokeStyle = "#ca5";
        ctx.lineWidth = 8 / ((el.scale.x * el.scale.y) / (el.scale.x + el.scale.y));

        ctx.fillStyle = "rgba(90, 110, 240, 0.5)";

        ctx.beginPath();
        switch (el.usedTool) {
          case ToolType.RECT:
            ctx.fillRect(0, 0, el.rect.width, el.rect.height);
            ctx.rect(0, 0, el.rect.width, el.rect.height);
            break;
          case ToolType.ARROW:
            ctx.moveTo(0, 0);
            ctx.lineTo(el.rect.width, el.rect.height);

            break;
        }
        ctx.stroke();
      }
    } else if (el.usedTool === ToolType.TEXT) {
      if (textareaRef.current === null) return;

      width = textScroll.width;
      height = textScroll.height;
      textareaRef.current.style.width = `${width}px`;
      textareaRef.current.style.height = `${height}px`;
      textareaRef.current.style.transform = `${translate} ${rotate} ${scale}`;
    }

    if (el.isSelect) {
      setTimeout(() => {
        if (textareaRef.current === null) return;
        textareaRef.current.focus();
      }, 0);

      setStyle({
        width: width,
        height: height,
        transform: `${translate} ${rotate} `,
        scale: { x: el.scale.x, y: el.scale.y },
      });
    }
  }, [
    el.isSelect,
    el.rect.left,
    el.rect.top,
    el.rect.width,
    el.rect.height,
    el.rotate,
    el.scale.x,
    el.scale.y,
    el.translate.x,
    el.translate.y,
    textScroll,
  ]);

  return (
    <>
      {(ToolType.RECT === el.usedTool || ToolType.ARROW === el.usedTool) && (
        <canvas className="draw_element" ref={canvasRef}></canvas>
      )}
      {ToolType.TEXT === el.usedTool && (
        <textarea
          id={`${el.pickingColor.a}${el.pickingColor.g}${el.pickingColor.b}`}
          className="draw_text_element"
          ref={textareaRef}
          placeholder="text..."
          onChange={onChangeTextarea}
          onBlur={onBlurTextarea}
        />
      )}
    </>
  );
};

export default DrawElementCanvas;
