import "./toolBox.scss";

import { useEffect, useRef } from "react";

import line from "/assets/line.svg";
import lock from "/assets/lock.svg";
import unlock from "/assets/unlock.svg";
import rect from "/assets/rect.svg";
import select from "/assets/select.svg";
import text from "/assets/text.svg";
import { useSelectedToolStore, useToolFixStore } from "../store/store";
import { ToolType } from "../type/common";
import ToolButton from "./ToolButton";

const toolList: ToolType[] = [ToolType.SELECT, ToolType.RECT, ToolType.ARROW, ToolType.TEXT];
const toolImageList = [select, rect, line, text];

const ToolBox = () => {
  const toolBoxRef = useRef<HTMLUListElement>(null);

  const { isFixed, setIsFixed } = useToolFixStore();
  const { getTool, setTool } = useSelectedToolStore();

  const onLockToggle = (event: MouseEvent) => {
    setIsFixed(!isFixed);
  };

  const onClickTool = (event: MouseEvent, type: ToolType) => {
    setTool(type);
  };

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (toolBoxRef.current === null) return;
      toolBoxRef.current.style.transform = `scale(${1.0 / window.devicePixelRatio})`;
    });
  }, []);

  return (
    <>
      <div className="tool_box_container">
        <ul className="tool_box" ref={toolBoxRef}>
          {isFixed ? (
            <ToolButton select="select" url={lock} onClick={(event) => onLockToggle(event)} />
          ) : (
            <ToolButton select="" url={unlock} onClick={(event) => onLockToggle(event)} />
          )}
          {toolList.map((type, index) => {
            return (
              <ToolButton
                select={type === getTool() ? "select" : ""}
                url={toolImageList[index]}
                onClick={(event) => onClickTool(event, type)}
              />
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default ToolBox;
