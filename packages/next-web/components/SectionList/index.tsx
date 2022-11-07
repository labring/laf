import React from "react";

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
  key: string;
  onClick: () => void;
}) {
  const { children, isActive, onClick } = props;
  return (
    <li className={isActive ? styles.active : ""} onClick={onClick}>
      {children}
    </li>
  );
}

SectionList.Item = Item;

export default SectionList;
