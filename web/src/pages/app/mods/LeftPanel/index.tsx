import React from "react";

export default function LeftPanel(props: { children: React.ReactNode; isHidden?: boolean }) {
  return (
    <div
      className="bg-white h-full float-left rounded-md mx-2 px-4"
      style={{ width: "300px", display: props.isHidden ? "none" : "block" }}
    >
      {props.children}
    </div>
  );
}
