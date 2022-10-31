/****************************
 * cloud functions list sidebar
 ***************************/

import {
  AddIcon,
  AttachmentIcon,
  HamburgerIcon,
  SettingsIcon,
  SunIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { Input } from "@chakra-ui/react";
import React from "react";

import styles from "./index.module.scss";
import commonStyles from "../../index.module.scss";

export default function DependecyList() {
  return (
    <div>
      <div className={commonStyles.sectionHeader + " flex justify-between"}>
        <h4>NPM 依赖</h4>
      </div>
      <div className="flex items-center mb-2">
        <Input />
        <WarningIcon />
      </div>

      <ul className={styles.functionList + " mb-4"}>
        <li>
          <div>
            <AttachmentIcon />
            axios
          </div>
          <div className={styles.status}>0.24.0</div>
        </li>
      </ul>
    </div>
  );
}
