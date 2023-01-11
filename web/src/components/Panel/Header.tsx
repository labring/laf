import React from "react";
import { HStack } from "@chakra-ui/react";
import clsx from "clsx";

import styles from "./index.module.scss";

const PanelHeader: React.FC<{
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  actions?: React.ReactNode[];
  title?: React.ReactNode | string;
}> = (props) => {
  const { title, actions, children, style = {}, className } = props;
  return title ? (
    <div className={styles.sectionHeader + " flex justify-between"}>
      <h4>{title}</h4>
      <HStack spacing="2">{actions}</HStack>
    </div>
  ) : (
    <div style={style} className={clsx(styles.sectionHeader + " flex justify-between", className)}>
      {children}
    </div>
  );
};

export default PanelHeader;
