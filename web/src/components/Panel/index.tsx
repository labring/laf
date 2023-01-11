import React from "react";
import clsx from "clsx";

import PanelHeader from "./Header";

const Panel = (props: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const { className, style = {} } = props;
  return (
    <div
      style={style}
      className={clsx("bg-white rounded m-2 px-4 flex flex-col flex-1", className)}
    >
      {props.children}
    </div>
  );
};

Panel.Header = PanelHeader;

export default Panel;
