import React from "react";
import clsx from "clsx";
import SimpleBar from "simplebar-react";

import styles from "./index.module.scss";

function SectionList(
  props: { children: React.ReactNode; className?: string } & Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children"
  >,
) {
  const { className, children, ...restProps } = props;

  return (
    <SimpleBar
      className={clsx(styles.sectionList, "flex flex-col overflow-y-auto", className || "")}
      {...restProps}
    >
      {children}
    </SimpleBar>
  );
}

function Item(
  props: {
    children: React.ReactNode;
    isActive: boolean;
    className?: string;
    size?: "small" | "default";
  } & Omit<React.HTMLAttributes<HTMLLIElement>, "children">,
) {
  const { children, isActive, className, size = "default", ...restProps } = props;

  return (
    <li
      className={clsx(className, {
        [styles.active]: isActive,
        [styles.small]: size === "small",
      })}
      {...restProps}
    >
      {children}
    </li>
  );
}

SectionList.Item = Item;

export default SectionList;
