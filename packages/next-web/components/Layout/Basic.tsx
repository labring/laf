import React, { ReactNode } from "react";
import Header from "@/components/Header";

export default function BasicLayout(props: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {props.children}
    </div>
  );
}
