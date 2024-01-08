import { useEffect, useRef, useState } from "react";
import { DrawElement } from "../type/type";

const DrawElementCanvas = ({ el }: { el: DrawElement }): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>("black");

  if (canvasRef.current) {
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.src = el.dataUrl;
    canvasRef.current.width = el.width + el.left;
    canvasRef.current.height = el.height + el.top;
    canvasRef.current.style.backgroundColor = color;

    // 이미지를 그대로 Context로 옮긴느 법..
    if (ctx) {
      ctx.drawImage(img, 0, 0);

      // canvasRef.current.style.transform = `translate(${el.left}px, ${el.top}px)`;
    }
  }

  useEffect(() => {
    if (canvasRef.current) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const a = 1;
      const randomColor = `rgba(${r},${g},${b},${a})`;
      setColor(randomColor);
      canvasRef.current.style.backgroundColor = randomColor;
    }
  }, []);

  return (
    <>
      <canvas ref={canvasRef}></canvas>
    </>
  );
};

export default DrawElementCanvas;
