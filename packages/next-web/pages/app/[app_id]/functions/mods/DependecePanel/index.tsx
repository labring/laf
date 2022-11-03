/****************************
 * cloud functions list sidebar
 ***************************/

import React from "react";
import { AttachmentIcon, WarningIcon } from "@chakra-ui/icons";
import { HStack, Input } from "@chakra-ui/react";

import AddDepenceModal from "./AddDepenceModal";

import commonStyles from "../../index.module.scss";
import styles from "./index.module.scss";

export default function DependecyList() {
  return (
    <div>
      <div className={commonStyles.sectionHeader + " flex justify-between"}>
        <h4>NPM 依赖</h4>
        <HStack spacing="2">
          <AddDepenceModal />
        </HStack>
      </div>
      <div>
        {/* <div className="flex items-center m-2 ">
          <Input size="sm" className="mr-2" />
        </div> */}

        <ul className={styles.functionList + " mb-4"}>
          <li>
            <div>
              <AttachmentIcon />
              <span className="ml-2">axios</span>
            </div>
            <div className={styles.status}>0.24.0</div>
          </li>
        </ul>
      </div>
    </div>
  );
}
