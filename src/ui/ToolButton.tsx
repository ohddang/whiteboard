import classNames from "classnames";

type ToolButtonProps = {
  select?: string;
  url?: string;
  color?: string;
  onClick?: (event: any) => void;
};

const ToolButton = ({ select, url, color = "", onClick }: ToolButtonProps) => {
  return (
    <li
      key={url}
      className={classNames("tool_button", select)}
      onClick={onClick}
      style={{ backgroundColor: `${color}` }}>
      <img src={url} alt={url} />
    </li>
  );
};

export default ToolButton;
