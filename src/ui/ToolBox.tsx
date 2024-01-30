import "../css/toolBox.scss";
import arrow from "/assets/arrow.svg";
import lock from "/assets/lock.svg";
import unlock from "/assets/unlock.svg";
import move from "/assets/move.svg";
import rect from "/assets/rect.svg";
import select from "/assets/select.svg";
import text from "/assets/text.svg";
import image from "/assets/image.svg";

const ToolBox = () => {
  return (
    <>
      <div className="tool_box_container">
        <ul className="tool_box">
          <li>
            <img src={lock} />
          </li>
          <li>
            <img src={move} />
          </li>
          <li>
            <img src={select} />
          </li>
          <li>
            <img src={rect} />
          </li>
          <li>
            <img src={arrow} />
          </li>
          <li>
            <img src={text} />
          </li>
          <li>
            <img src={image} />
          </li>
        </ul>
      </div>
    </>
  );
};

export default ToolBox;
