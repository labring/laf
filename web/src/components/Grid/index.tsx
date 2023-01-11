import React from "react";
import clsx from "clsx";

function Grid() {
  return <div>Grid</div>;
}

function Row(props: { className?: string; children: React.ReactNode }) {
  const { className } = props;
  return <div className={clsx(className, "flex flex-1 space-x-2 w-full")}>{props.children}</div>;
}

function Col(props: { className?: string; children: React.ReactNode }) {
  const { className } = props;
  return (
    <div className={clsx(className, "flex flex-col space-y-2 flex-1 h-full")}>{props.children}</div>
  );
}

export { Col, Row };
export default Grid;
