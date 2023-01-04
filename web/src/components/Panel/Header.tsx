import React from "react";
import clsx from "clsx";

import styles from "./index.module.scss";

export default function PanelHeader(props: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(styles.sectionHeader, props.className, "flex items-center justify-between ")}
    >
      {props.children}
    </div>
  );
}
