import "./drawElement.scss";
import { useEffect, useRef } from "react";
import { DrawElement, ToolType } from "../type/common";
import { useSelectionLayoutStyle } from "../store/store";

const DrawElementCanvas: React.FC<{ el: DrawElement }> = ({
  el,
}: {
  el: DrawElement;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setStyle } = useSelectionLayoutStyle();

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.width = el.rect.width;
      img.height = el.rect.height;

      canvasRef.current.width = el.rect.width;
      canvasRef.current.height = el.rect.height;

      if (ctx && el.imageData) {
        ctx.putImageData(el.imageData, 0, 0);

        const translate = `translate(${el.rect.left}px, ${el.rect.top}px)`;
        const rotate = `rotate(${el.rotate}deg)`;

        const translateOrigin = `translate(${el.transformOrigin.x}px, ${el.transformOrigin.y}px)`;
        const scale = `scale(${el.scale.x}, ${el.scale.y})`;
        const translateRevert = `translate(${-el.transformOrigin.x}px, ${-el
          .transformOrigin.y}px)`;

        canvasRef.current.style.transform = `${translate} ${rotate} ${translateOrigin} ${scale} ${translateRevert}`;
        if (el.isSelect) {
          setStyle({
            width: `${el.rect.width}px`,
            height: `${el.rect.height}px`,
            transform: `${translate} ${rotate} ${translateOrigin} ${scale} ${translateRevert}`,
          });
        }
      }
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
    el.translate,
  ]);

  return (
    <>
      <canvas className="draw_element" ref={canvasRef}></canvas>
    </>
  );
};

export default DrawElementCanvas;
