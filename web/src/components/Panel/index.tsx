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
    <div style={style} className={clsx("bg-white rounded px-4 flex flex-col h-full", className)}>
      {props.children}
    </div>
  );
};

Panel.Header = PanelHeader;

export default Panel;
