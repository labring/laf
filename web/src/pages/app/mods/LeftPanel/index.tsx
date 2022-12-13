import React from "react";

export default function LeftPanel(props: { children: React.ReactNode }) {
  return (
    <div className="border-r border-gray-300 h-full float-left" style={{ width: "300px" }}>
      {props.children}
    </div>
  );
}
