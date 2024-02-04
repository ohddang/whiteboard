import "./toolBox.scss";
import arrow from "/assets/arrow.svg";
import lock from "/assets/lock.svg";
import unlock from "/assets/unlock.svg";
import move from "/assets/move.svg";
import rect from "/assets/rect.svg";
import select from "/assets/select.svg";
import text from "/assets/text.svg";
import image from "/assets/image.svg";
import classNames from "classnames";
import { useSelectedToolStore, useToolFixStore } from "../store/store";
import { ToolType } from "../type/common";

type ToolButtonProps = {
  select: string;
  type: string;
  onClick: (event: any) => void;
};

const toolList: ToolType[] = [
  ToolType.MOVE,
  ToolType.SELECT,
  ToolType.RECT,
  ToolType.ARROW,
  ToolType.TEXT,
  ToolType.IMAGE,
];

const toolImageList = [move, select, rect, arrow, text, image];

const ToolBox = () => {
  const { isFixed, setIsFixed } = useToolFixStore();
  const { tool, setTool } = useSelectedToolStore();

  const onLockToggle = (event: MouseEvent) => {
    setIsFixed(!isFixed);
  };

  const onClickTool = (event: MouseEvent, type: ToolType) => {
    setTool(type);
  };

  const ToolButton = ({ select, type, onClick }: ToolButtonProps) => {
    return (
      <li
        key={type}
        className={classNames("tool_button", select)}
        onClick={onClick}
      >
        <img src={type} alt={type} />
      </li>
    );
  };

  return (
    <>
      <div className="tool_box_container">
        <ul className="tool_box">
          {isFixed ? (
            <ToolButton
              select="select"
              type={lock}
              onClick={(event) => onLockToggle(event)}
            />
          ) : (
            <ToolButton
              select=""
              type={unlock}
              onClick={(event) => onLockToggle(event)}
            />
          )}
          {toolList.map((type, index) => {
            return (
              <ToolButton
                select={type === tool ? "select" : ""}
                type={toolImageList[index]}
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
