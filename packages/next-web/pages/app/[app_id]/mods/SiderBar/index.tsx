/****************************
 * cloud functions siderbar menu
 ***************************/

import React from "react";
import { SpinnerIcon, TimeIcon, ViewOffIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Center } from "@chakra-ui/react";

import { Pages, SiderBarWidth } from "@/constants/index";

import styles from "./index.module.scss";

export default function SiderBar(props: { setPageId: (pageId: string) => void }) {
  const { setPageId } = props;
  return (
    <div
      style={{ width: SiderBarWidth, borderRight: "1px solid #eee" }}
      className="absolute h-screen"
    >
      <Center className={styles.icon} onClick={() => setPageId(Pages.function)}>
        <TimeIcon />
      </Center>
      <Center className={styles.icon} onClick={() => setPageId(Pages.database)}>
        <SpinnerIcon />
      </Center>
      <Center className={styles.icon} onClick={() => setPageId(Pages.storage)}>
        <WarningTwoIcon />
      </Center>
      <Center className={styles.icon} onClick={() => setPageId(Pages.function)}>
        <ViewOffIcon />
      </Center>
    </div>
  );
}
