import React from "react";
import clsx from "clsx";

import styles from "./index.module.scss";

function DependenceList(props: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <ul className={styles.dependenceList + " ml-4"} style={props.style || {}}>
      {props.children}
    </ul>
  );
}

function Item(props: {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
  style?: React.CSSProperties;
  key: string;
  onClick: () => void;
}) {
  const { children, isActive, onClick, className, style } = props;
  return (
    <li
      style={style || {}}
      className={clsx(className, {
        [styles.active]: isActive,
      })}
      onClick={onClick}
    >
      {children}
    </li>
  );
}

DependenceList.Item = Item;

export default DependenceList;
