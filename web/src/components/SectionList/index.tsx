import React from "react";
import clsx from "clsx";

import styles from "./index.module.scss";

function SectionList(props: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <ul
      className={styles.sectionList + " mb-4 text-grayIron-600 " + props.className}
      style={props.style || {}}
    >
      {props.children}
    </ul>
  );
}

function Item(props: {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
  key: string;
  size?: "small" | "default";
  onClick?: () => void;
}) {
  const { children, isActive, onClick, className, size = "default" } = props;
  return (
    <li
      className={clsx(className, {
        [styles.active]: isActive,
        [styles.small]: size === "small",
      })}
      onClick={onClick && onClick}
    >
      {children}
    </li>
  );
}

SectionList.Item = Item;

export default SectionList;
