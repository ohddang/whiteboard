import { useState, useEffect, useRef } from "react";
import { Site, DrawElement } from "../type/type";
import DrawElementCanvas from "./Picture";
import "../css/board.scss";

const initDrawElement: DrawElement = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  imageData: new ImageData(1, 1),
  pickingColor: { r: 0, g: 0, b: 0, a: 0 },
  isSelect: false,
  pickImage: new Image(),
};

const Board = (): JSX.Element => {
  const [path, setPath] = useState<Array<Site>>([]);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [drawElements, setDrawElements] = useState<Array<DrawElement>>([]);
  const [pickingElements, setPickingElements] = useState<Array<DrawElement>>(
    []
  );
  const [currentPickColor, setCurrentPickColor] = useState<any>({
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  }); // fix it type

  const mainCanvas = useRef<HTMLCanvasElement>(null);
  const pickingCanvas = useRef<HTMLCanvasElement>(null);

  const [currentSite, setCurrentSite] = useState<Site>([0, 0]);

  const onMouseDown = (e: MouseEvent) => {
    path.push([e.pageX, e.pageY]);
    path.push([e.pageX, e.pageY]);

    setPath(path);
    setIsDrag(true);

    // set current color picking key
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    const a = 255;
    const randomColor = [r, g, b, a];
    const newPickColor = new Array<number>();

    if (currentPickColor != undefined) {
      currentPickColor.r = r;
      currentPickColor.g = g;
      currentPickColor.b = b;
      currentPickColor.a = a;
    }

    setCurrentPickColor(currentPickColor);

    // color picking
    pickingColor(e.pageX, e.pageY);
  };

  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (isDrag) {
      path.push([e.pageX, e.pageY]);
      setPath(path);
      setCurrentSite([e.pageX, e.pageY]);
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    path.push([e.pageX, e.pageY]);

    setIsDrag(false);

    const ctx = mainCanvas.current?.getContext("2d");
    makeDrawElements();

    path.splice(0, path.length);
    setPath(path);

    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const onResize = (e: UIEvent) => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
    }
    const pickctx = pickingCanvas.current?.getContext("2d");
    if (pickctx) {
      pickctx.canvas.width = window.innerWidth;
      pickctx.canvas.height = window.innerHeight;
    }
  };

  const onLoad = (e: Event) => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (ctx) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
    }
    const pickctx = pickingCanvas.current?.getContext("2d");
    if (pickctx) {
      pickctx.canvas.width = window.innerWidth;
      pickctx.canvas.height = window.innerHeight;
    }
  };

  const drawElement = (): void => {
    const ctx = mainCanvas.current?.getContext("2d");

    if (path.length <= 1) return;

    if (ctx) {
      ctx.strokeStyle = "#ca5";
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);

      path.forEach((pos) => {
        ctx.lineTo(pos[0], pos[1]);
      });
      ctx.stroke();
    }
  };

  const drawPickingElement = (): void => {
    const ctx = pickingCanvas.current?.getContext("2d");

    if (path.length <= 1) return;

    if (ctx) {
      ctx.strokeStyle = `rgba(${currentPickColor?.r}, ${currentPickColor?.g}, ${currentPickColor?.b}, ${currentPickColor?.a})`;
      ctx.lineWidth = 20;

      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);

      path.forEach((pos) => {
        ctx.lineTo(pos[0], pos[1]);
      });
      ctx.stroke();
    }
  };

  const makeDrawElements = (): void => {
    // create child canvas element
    const newElement = getDrawElement();
    drawElements.push(newElement);
    setDrawElements(drawElements);

    // create picking canvas element
    const newPickElement = getDrawElement();

    const pickImage = new Image();
    pickImage.width = newPickElement.width;
    pickImage.height = newPickElement.height;
    pickImage.src = pickingCanvas.current?.toDataURL()
      ? pickingCanvas.current?.toDataURL()
      : "";

    newPickElement.pickImage = pickImage;

    pickingElements.push(newPickElement);
    setPickingElements(pickingElements);
  };

  const createDrawElement = () => {
    drawPickingCanvas();
    return drawElements.map((element) => <DrawElementCanvas el={element} />);
  };

  const getDrawElement = (): DrawElement => {
    const ctx = mainCanvas.current?.getContext("2d");
    if (!ctx) {
      return initDrawElement;
    }
    let max_x = Number.MIN_SAFE_INTEGER;
    let min_x = Number.MAX_SAFE_INTEGER;
    let max_y = Number.MIN_SAFE_INTEGER;
    let min_y = Number.MAX_SAFE_INTEGER;

    path.forEach((pos) => {
      if (pos[0] > max_x) max_x = pos[0];
      if (pos[0] < min_x) min_x = pos[0];
      if (pos[1] > max_y) max_y = pos[1];
      if (pos[1] < min_y) min_y = pos[1];
    });

    // line width 만큼 영역 확장
    min_x -= 5;
    min_y -= 5;
    max_x += 5;
    max_y += 5;

    const newElement: DrawElement = {
      left: min_x,
      top: min_y,
      width: max_x - min_x,
      height: max_y - min_y,
      imageData: ctx.getImageData(
        min_x,
        min_y,
        Math.max(1, max_x - min_x),
        Math.max(1, max_y - min_y)
      ),
      pickingColor: {
        r: currentPickColor?.r ? currentPickColor?.r : 0,
        g: currentPickColor?.g ? currentPickColor?.g : 0,
        b: currentPickColor?.b ? currentPickColor?.b : 0,
        a: currentPickColor?.a ? currentPickColor?.a : 0,
      },
      isSelect: false,
      pickImage: new Image(),
    };
    return newElement;
  };

  const pickingColor = (x: number, y: number) => {
    const ctx = pickingCanvas.current?.getContext("2d");
    if (ctx) {
      const pickColor = ctx.getImageData(x, y, 1, 1).data;
      drawElements.forEach((element) => {
        if (
          element.pickingColor.r === pickColor[0] &&
          element.pickingColor.g === pickColor[1] &&
          element.pickingColor.b === pickColor[2]
        ) {
          element.isSelect = true;
        } else {
          element.isSelect = false;
        }
      });
    }
    setDrawElements(drawElements);
  };

  const drawPickingCanvas = () => {
    const ctx = pickingCanvas.current?.getContext("2d");

    pickingElements.forEach((element) => {
      if (ctx) {
        ctx.drawImage(element.pickImage, 0, 0);
      }
    });
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
    drawPickingElement();
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [currentSite, isDrag]);

  return (
    <>
      <div className="board">
        {createDrawElement()}
        <div className="canvas_container">
          <canvas className="main_canvas" ref={mainCanvas}></canvas>
          <canvas className="picking_canvas" ref={pickingCanvas}></canvas>
        </div>
      </div>
    </>
  );
};

export default Board;
