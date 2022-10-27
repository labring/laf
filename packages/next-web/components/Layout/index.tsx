import { i18n } from "next-i18next";
import React, { ReactNode } from "react";
import Header from "../Header";

export default function Layout(props: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {props.children}
    </div>
  );
}
