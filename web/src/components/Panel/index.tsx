import React from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { HStack } from "@chakra-ui/react";

import styles from "./index.module.scss";

export default function Panel(props: {
  actions: React.ReactNode[];
  title: React.ReactNode | string;
  children: React.ReactNode;
}) {
  const { title, actions } = props;
  return (
    <div>
      <div className={styles.sectionHeader + " flex justify-between bg-white"}>
        <h4>
          <ChevronDownIcon fontSize={16} />
          {title}
        </h4>
        <HStack spacing="2">{actions}</HStack>
      </div>

      <div>{props.children}</div>
    </div>
  );
}
