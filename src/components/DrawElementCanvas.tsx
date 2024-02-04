import { useEffect, useRef } from "react";
import { DrawElement } from "../type/common";
import "./drawElement.scss";

const DrawElementCanvas: React.FC<{ el: DrawElement }> = ({
  el,
}: {
  el: DrawElement;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        canvasRef.current.style.transform = `translate(${el.rect.left}px, ${
          el.rect.top
        }px) rotate(${1}deg)`;
      }
      if (el.isSelect) {
        canvasRef.current.style.outline = "5px solid red";
      } else {
        canvasRef.current.style.outline = "none";
      }
    }
  }, [el.isSelect, el.rect.left, el.rect.top, el.rect.width, el.rect.height]);

  return (
    <>
      <canvas className="drawElement" ref={canvasRef}></canvas>
    </>
  );
};

export default DrawElementCanvas;
