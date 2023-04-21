import React from "react";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { COLOR_MODE } from "@/constants";

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
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <li
      style={style || {}}
      className={clsx(className, {
        "bg-primary-100": !darkMode && isActive,
        "hover:bg-primary-100": !darkMode,
        "hover:bg-lafDark-100": darkMode,
        "bg-lafDark-100": darkMode && isActive,
      })}
      onClick={onClick}
    >
      {children}
    </li>
  );
}

DependenceList.Item = Item;

export default DependenceList;
