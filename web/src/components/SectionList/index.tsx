import React, { MouseEventHandler } from "react";
import clsx from "clsx";
import SimpleBar from "simplebar-react";

import styles from "./index.module.scss";

function SectionList(props: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <SimpleBar
      className={styles.sectionList + " flex flex-col overflow-y-auto " + props.className}
      style={props.style || {}}
    >
      {props.children}
    </SimpleBar>
  );
}

function Item(props: {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
  key: string;
  size?: "small" | "default";
  onClick?: () => void;
  onContextMenu?: MouseEventHandler<HTMLLIElement>;
  onBlur?: () => void;
}) {
  const { children, isActive, onClick, onContextMenu, className, size = "default", onBlur } = props;
  return (
    <li
      className={clsx(className, {
        [styles.active]: isActive,
        [styles.small]: size === "small",
      })}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onBlur={onBlur}
    >
      {children}
    </li>
  );
}

SectionList.Item = Item;

export default SectionList;
