import React from "react";
import clsx from "clsx";

import styles from "./index.module.scss";

function DepenceList(props: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <ul className={styles.depenceList + " ml-4"} style={props.style || {}}>
      {props.children}
    </ul>
  );
}

function Item(props: {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
  key: string;
  onClick: () => void;
}) {
  const { children, isActive, onClick, className } = props;
  return (
    <li
      className={clsx(className, {
        [styles.active]: isActive,
      })}
      onClick={onClick}
    >
      {children}
    </li>
  );
}

DepenceList.Item = Item;

export default DepenceList;
