import { useEffect, useRef, useState } from "react";
import { DrawElement } from "../type/type";

const DrawElementCanvas = ({ el }: { el: DrawElement }): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>("black");

  const ctx = canvasRef.current?.getContext("2d");
  if (ctx) {
    const img = new Image();
    img.src = el.dataUrl;
    console.log(img.title);
    ctx.drawImage(img, 0, 0);
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      // canvas setting random color
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const a = Math.random() + 0.5;
      const randomColor = `backgroundColor: rgba(${r},${g},${b},${a})`;
      setColor(randomColor);
    }
  }, []);

  return (
    <>
      <canvas ref={canvasRef}></canvas>
    </>
  );
};

export default DrawElementCanvas;
