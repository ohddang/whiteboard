import "./drawElement.scss";
import { useEffect, useRef } from "react";
import { DrawElement, ToolType } from "../type/common";
import { useSelectionLayoutStyle } from "../store/store";
import image from "/assets/image.svg";

const DrawElementCanvas: React.FC<{ el: DrawElement }> = ({ el }: { el: DrawElement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setStyle } = useSelectionLayoutStyle();

  const onChangeInput = (event: any) => {
    console.log("change input ", event.target.value);
  };

  useEffect(() => {
    const translate = `translate(${el.translate.x}px, ${el.translate.y}px)`;
    const rotate = `rotate(${el.rotate}deg)`;
    const scale = `scale(${el.scale.x}, ${el.scale.y})`;

    if (el.usedTool === ToolType.RECT || el.usedTool === ToolType.ARROW) {
      if (canvasRef.current === null) return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      if (el.imageData === undefined) return;

      canvasRef.current.width = el.rect.width;
      canvasRef.current.height = el.rect.height;
      canvasRef.current.style.transform = `${translate} ${rotate} ${scale}`;

      const img = new Image();
      img.width = el.rect.width;
      img.height = el.rect.height;
      ctx.putImageData(el.imageData, 0, 0);
    } else if (el.usedTool === ToolType.TEXT) {
      if (inputRef.current === null) return;
      inputRef.current.style.width = `100px`;
      inputRef.current.style.height = `50px`;
      inputRef.current.style.transform = `${translate} ${rotate} ${scale}`;
    }

    if (el.isSelect) {
      setTimeout(() => {
        if (inputRef.current === null) return;
        inputRef.current.focus();
      }, 0);

      setStyle({
        width: `${el.rect.width}px`,
        height: `${el.rect.height}px`,
        transform: `${translate} ${rotate} ${scale}`,
        invertScale: { x: 1 / el.scale.x, y: 1 / el.scale.y },
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
  ]);

  return (
    <>
      {(ToolType.RECT === el.usedTool || ToolType.ARROW === el.usedTool) && (
        <canvas className="draw_element" ref={canvasRef}></canvas>
      )}
      {ToolType.TEXT === el.usedTool && (
        <input
          id={`${el.pickingColor.a}${el.pickingColor.g}${el.pickingColor.b}`}
          className="draw_element"
          ref={inputRef}
          placeholder="text..."
          onChange={onChangeInput}
          size={10}
        />
      )}
    </>
  );
};

export default DrawElementCanvas;
