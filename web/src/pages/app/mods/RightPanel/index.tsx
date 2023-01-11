import React from "react";

export default function RightPanel(props: { children: React.ReactNode }) {
  return (
    <div className="bg-white overflow-hidden h-full px-4 ml-2 rounded-md">{props.children}</div>
  );
}
