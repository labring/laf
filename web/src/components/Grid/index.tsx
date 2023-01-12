import React from "react";
import clsx from "clsx";

function Grid() {
  return <div>Grid</div>;
}

function Row(props: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { className, style } = props;
  return (
    <div
      className={clsx(
        "flex space-x-2 w-full",
        style?.height ? "flex-none" : "flex-grow",
        className,
      )}
      style={style}
    >
      {props.children}
    </div>
  );
}

function Col(props: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { className, style } = props;
  return (
    <div
      className={clsx(
        "flex flex-col space-y-2 h-full",
        style?.width ? "flex-none" : "flex-grow",
        className,
      )}
      style={style}
    >
      {props.children}
    </div>
  );
}

export { Col, Row };
export default Grid;
