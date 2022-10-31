/****************************
 * cloud functions siderbar menu
 ***************************/

import { SiderBarWith } from "@/constants/index";
import {
  SpinnerIcon,
  TimeIcon,
  ViewOffIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import { Center } from "@chakra-ui/react";
import React from "react";

import styles from "./index.module.scss";

export default function SiderBar() {
  return (
    <div
      style={{ width: SiderBarWith, borderRight: "1px solid #eee" }}
      className="absolute h-screen"
    >
      <Center className={styles.icon}>
        <TimeIcon />
      </Center>
      <Center className={styles.icon}>
        <SpinnerIcon />
      </Center>
      <Center className={styles.icon}>
        <WarningTwoIcon />
      </Center>
      <Center className={styles.icon}>
        <ViewOffIcon />
      </Center>
    </div>
  );
}
