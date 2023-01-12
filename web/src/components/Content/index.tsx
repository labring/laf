import React from "react";

export default function Content(props: { children: React.ReactNode }) {
  return <div className="flex-1 flex flex-col overflow-hidden space-y-2">{props.children}</div>;
}
