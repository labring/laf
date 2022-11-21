import React from "react";
import clsx from "clsx";

import styles from "./index.module.scss";

export default function PanelHeader(props: { children: React.ReactNode }) {
  return (
    <div className={clsx(styles.sectionHeader, "flex items-center justify-between border-b")}>
      {props.children}
    </div>
  );
}
