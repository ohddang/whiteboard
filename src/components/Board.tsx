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
    position.splice(0, position.length); // position 초기화
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
    const newElement = getDrawElement();

    console.log(
      newElement.top +
        " " +
        newElement.left +
        " " +
        newElement.width +
        " " +
        newElement.height
    );
    drawElements.push(newElement);
    setDrawElements(drawElements);
  };

  const createDrawElement = () => {
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

  const getDrawElement = (): DrawElement => {
    let max_x = Number.MIN_SAFE_INTEGER;
    let min_x = Number.MAX_SAFE_INTEGER;
    let max_y = Number.MIN_SAFE_INTEGER;
    let min_y = Number.MAX_SAFE_INTEGER;

    position.forEach((pos) => {
      if (pos[0] > max_x) max_x = pos[0];
      if (pos[0] < min_x) min_x = pos[0];
      if (pos[1] > max_y) max_y = pos[1];
      if (pos[1] < min_y) min_y = pos[1];
    });

    const newElement: DrawElement = {
      dataUrl: mainCanvas.current
        ? mainCanvas.current.toDataURL("image/png")
        : "",
      left: min_x,
      top: min_y,
      width: max_x - min_x,
      height: max_y - min_y,
    };
    return newElement;
  };

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
