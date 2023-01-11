import React from "react";

function Grid() {
  return <div>Grid</div>;
}

function Col(props: { children: React.ReactNode }) {
  return <div className="flex flex-col flex-1">{props.children}</div>;
}

export { Col };
export default Grid;
