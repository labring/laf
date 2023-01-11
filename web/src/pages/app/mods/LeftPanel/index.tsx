import React from "react";

export default function LeftPanel(props: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col" style={{ width: "300px" }}>
      {props.children}
    </div>
  );
}
