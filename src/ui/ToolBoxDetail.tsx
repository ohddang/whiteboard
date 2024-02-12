import { useEffect, useRef } from "react";
import { ColorCollection, FontType } from "../type/common";
import ToolButton from "./ToolButton";
import { useColorStore, useFontStoreType } from "../store/store";
import fontCode from "/assets/font_code.svg";
import fontNormal from "/assets/font_normal.svg";
import fontPencil from "/assets/font_pencil.svg";

const fontList = [FontType.NORMAL, FontType.PENCIL, FontType.CODE];
const fontImageList = [fontNormal, fontPencil, fontCode];

const colorList: ColorCollection[] = [
  ColorCollection.PINK,
  ColorCollection.RED,
  ColorCollection.GREEN,
  ColorCollection.BLUE,
  ColorCollection.BROWN,
];

const ToolBoxDetail = () => {
  const toolBoxRef = useRef<HTMLUListElement>(null);
  const toolColorRef = useRef<HTMLUListElement>(null);
  const { font, setFont } = useFontStoreType();
  const { color, setColor } = useColorStore();

  const onClickColor = (event: MouseEvent, color: ColorCollection) => {
    setColor(color);
  };

  const onClickFont = (event: MouseEvent, font: FontType) => {
    setFont(font);
  };

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (toolBoxRef.current === null) return;
      toolBoxRef.current.style.transform = `scale(${1.0 / window.devicePixelRatio})`;

      if (toolColorRef.current === null) return;
      toolColorRef.current.style.transform = `scale(${1.0 / window.devicePixelRatio})`;
    });
  }, []);

  return (
    <>
      <div>
        <div className="tool_box_container_vertical">
          <ul className="tool_box_vertical" ref={toolBoxRef}>
            {colorList.map((colorType, index) => {
              return (
                <ToolButton
                  select={color === colorType ? "selectColor select" : "selectColor"}
                  color={colorType}
                  onClick={(event) => onClickColor(event, colorType)}
                />
              );
            })}
            <ToolButton select={"empty"} />
            {fontList.map((type, index) => {
              return (
                <ToolButton
                  select={type === font ? "select" : ""}
                  url={fontImageList[index]}
                  onClick={(event) => onClickFont(event, type)}
                />
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ToolBoxDetail;
