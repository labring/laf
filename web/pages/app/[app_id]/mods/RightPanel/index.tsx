import React from "react";

export default function RightPanel(props: { children: React.ReactNode }) {
  return <div className="overflow-hidden h-full">{props.children}</div>;
}
