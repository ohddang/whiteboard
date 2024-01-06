import { useState, useEffect, useRef } from "react";
//
// 현재 active 객체 관리.. mouse up될때 하위 component로 canvas를 생성해서 그려줌
//

type Pair = [number, number];

const Board = (): JSX.Element => {
  const [position, setPosition] = useState(Array<Pair>);
  const mainCanvas = useRef<HTMLCanvasElement>(null);
  const [x, setX] = useState(0);
  console.log("시작 " + position.length);

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  function onMouseDown(e: MouseEvent) {
    const prevPosition = [...position];

    prevPosition.push([e.pageX, e.pageY]);
    setPosition(prevPosition);
    setX(e.pageX);
  }

  function onMouseMove(e: MouseEvent) {
    const prevPosition = [...position];

    prevPosition.push([e.pageX, e.pageY]);
    setPosition(prevPosition);
    setX(e.pageX);
  }

  function onMouseUp(e: MouseEvent) {
    const prevPosition = [...position];

    prevPosition.push([e.pageX, e.pageY]);
    setPosition(prevPosition);
    setX(e.pageX);
  }

  function onResize<T>(e: T) {
    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
      setContext(ctx);
    }
  }

  const drawElement = (): void => {
    const ctx = context;

    if (position.length === 0) return;

    if (ctx) {
      ctx.strokeStyle = "#ff0";
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(position[0][0], position[0][1]);

      position.forEach((pos) => {
        ctx.lineTo(pos[0], pos[1]);
      });
      ctx.stroke();

      setContext(ctx);
      console.log("draw " + position.length);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
  }, [position]);

  useEffect(() => {
    drawElement();
    window.addEventListener("mousemove", onMouseMove);
  }, [position]);

  return (
    <>
      <div className="absolute inset-0 box-border w-screen h-screen flex flex-row items-center justify-items-center justify-between">
        <div className="text-gray-500/50 text-4xl text-center grow">그려라</div>
        <div className="text-gray-500/50 text-4xl text-center grow">그려라</div>
        <div className="text-gray-500/50 text-4xl text-center grow">그려라</div>
      </div>
      <canvas id="main" className="w-screen h-screen" ref={mainCanvas}></canvas>
    </>
  );
};

export default Board;
