import { useState, useEffect, useRef } from "react";
import { Site, DrawElement } from "../type/type";
import DrawElementCanvas from "./Picture";

import "./board.scss";
//
// 현재 active 객체 관리.. mouse up될때 하위 component로 canvas를 생성해서 그려줌
//

const Board = (): JSX.Element => {
  const [position, setPosition] = useState<Array<Site>>([]);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [drawElements, setDrawElements] = useState<Array<DrawElement>>([]);

  const mainCanvas = useRef<HTMLCanvasElement>(null);
  const ctx = mainCanvas.current?.getContext("2d");

  const [currentSite, setCurrentSite] = useState<Site>([0, 0]);

  const onMouseDown = (e: MouseEvent) => {
    position.push([e.pageX, e.pageY]);
    position.push([e.pageX, e.pageY]);
    setPosition(position);

    setIsDrag(true);
  };

  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    console.log(isDrag);
    if (isDrag) {
      position.push([e.pageX, e.pageY]);
      setPosition(position);
      setCurrentSite([e.pageX, e.pageY]);
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    // TODO : 현재 path 정보로 child canvas 생성
    position.push([e.pageX, e.pageY]);
    setPosition(position);

    setIsDrag(false);

    makeDrawElements();
    position.splice(0, position.length);
    setPosition(position);

    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const onResize = (e: UIEvent) => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
    }
  };

  const onLoad = (e: Event) => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
    }
  };

  const drawElement = (): void => {
    if (position.length <= 1) return;

    if (ctx) {
      ctx.strokeStyle = "#cc5";
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(position[0][0], position[0][1]);

      position.forEach((pos) => {
        ctx.lineTo(pos[0], pos[1]);
      });

      ctx.stroke();
    }
  };

  const makeDrawElements = (): void => {
    const newElement: DrawElement = { start: [0, 0], dataUrl: "" };

    if (mainCanvas.current) {
      newElement.dataUrl = mainCanvas.current.toDataURL("image/png");
    }
    drawElements.push(newElement);
    setDrawElements(drawElements);
  };

  const createDrawElement = () => {
    console.log(drawElements.length);
    return drawElements.map((element) => <DrawElementCanvas el={element} />);
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    drawElement();
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [currentSite, isDrag]);

  return (
    <>
      <div className="test_text">
        <div>그려라</div>
        <div>그려라</div>
        <div>그려라</div>
      </div>
      <canvas id="main" ref={mainCanvas}></canvas>
      {createDrawElement()}
    </>
  );
};

export default Board;
