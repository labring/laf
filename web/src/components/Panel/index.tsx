import React from "react";
import clsx from "clsx";

import PanelHeader from "./Header";

const Panel = (props: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { className, style = {}, onClick } = props;
  return (
    <div
      style={style}
      onClick={onClick}
      className={clsx("bg-white rounded px-4 flex flex-col h-full w-full", className)}
    >
      {props.children}
    </div>
  );
};

Panel.Header = PanelHeader;

export default Panel;
