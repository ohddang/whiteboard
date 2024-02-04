import { useEffect, useRef } from "react";
import { DrawElement } from "../type/common";
import "./drawElement.scss";

const DrawElementCanvas: React.FC<{ el: DrawElement }> = ({
  el,
}: {
  el: DrawElement;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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
        const rotate = `rotate(${15}deg)`;
        const translateOrigin = `translate(${-el.rect.width / 2}px, ${
          -el.rect.height / 2
        }px)`;
        const scale = `scale(${1.2}, ${1.2})`;
        const translateRevert = `translate(${el.rect.width / 2}px, ${
          el.rect.height / 2
        }px)`;

        canvasRef.current.style.transform = `${translate} ${rotate} ${translateOrigin} ${scale} ${translateRevert}`;

        if (canvasContainerRef.current) {
          canvasContainerRef.current.style.width = `${el.rect.width}px`;
          canvasContainerRef.current.style.height = `${el.rect.height}px`;
          canvasContainerRef.current.style.transform =
            canvasRef.current.style.transform;
        }
      }
    }
  }, [el.isSelect, el.rect.left, el.rect.top, el.rect.width, el.rect.height]);

  return (
    <>
      <canvas className="draw_element" ref={canvasRef}></canvas>
      {el.isSelect && (
        <div className="draw_element_tool" ref={canvasContainerRef}>
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
    </>
  );
};

export default DrawElementCanvas;
