import React from "react";
import clsx from "clsx";

import styles from "./index.module.scss";

function SectionList(props: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <ul className={styles.sectionList + " mb-4"} style={props.style || {}}>
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

SectionList.Item = Item;

export default SectionList;
