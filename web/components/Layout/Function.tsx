import React, { ReactNode } from "react";

import { SmallNavHeight } from "@/constants/index";

import Header from "../Header";

export default function FunctionLayout(props: { children: ReactNode }) {
  return (
    <div>
      <Header size="sm" />
      <div
        className="bg-white"
        style={{
          height: `calc(100vh - ${SmallNavHeight}px)`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
