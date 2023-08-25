import React from "react";
import clsx from "clsx";

import styles from "./index.module.scss";

export default function IconText(props: {
  icon: React.ReactElement;
  text: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={props.onClick}
      className={clsx("flex flex-col items-center " + styles.iconText, props.className)}
    >
      {React.cloneElement(props.icon, {
        height: "20px",
      })}
      {props.text}
    </div>
  );
}
