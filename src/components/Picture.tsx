import { useEffect, useRef, useState } from "react";
import { DrawElement } from "../type/type";
import "../css/picture.scss";

const DrawElementCanvas = ({ el }: { el: DrawElement }): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.width = el.width;
      img.height = el.height;

      canvasRef.current.width = el.width;
      canvasRef.current.height = el.height;

      if (ctx && el.imageData) {
        ctx.putImageData(el.imageData, 0, 0);
        canvasRef.current.style.transform = `translate(${el.left}px, ${el.top}px)`;
      }
      if (el.isSelect) {
        canvasRef.current.style.border = "5px solid red";
      } else {
        canvasRef.current.style.border = "none";
      }
    }
  }, [el.isSelect]);

  return (
    <>
      <canvas className="picture" ref={canvasRef}></canvas>
    </>
  );
};

export default DrawElementCanvas;
