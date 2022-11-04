/****************************
 * cloud functions list sidebar
 ***************************/

import React, { useEffect } from "react";
import { HStack } from "@chakra-ui/react";

import AddDepenceModal from "./AddDepenceModal";

import commonStyles from "../../../index.module.scss";
import styles from "./index.module.scss";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import useFunctionStore from "../../store";
import { ChevronRightIcon } from "@chakra-ui/icons";

export default function DependecyList() {
  const { getPacakges, allPackages } = useFunctionStore((store) => store);

  useEffect(() => {
    getPacakges();
    return () => {};
  }, [getPacakges]);

  return (
    <div>
      <div className={commonStyles.sectionHeader + " flex justify-between"}>
        <h4>
          <ChevronRightIcon fontSize={16} />
          NPM 依赖
        </h4>
        <HStack spacing="2">
          <AddDepenceModal />
        </HStack>
      </div>
      <div>
        {/* <div className="flex items-center m-2 ">
          <Input size="sm" className="mr-2" />
        </div> */}

        <ul className={styles.packageList + " mb-4"}>
          {allPackages?.map((packageItem) => {
            return (
              <li key={packageItem?.name}>
                <div>
                  <FileTypeIcon type={FileType.npm} />
                  <span className="ml-2">{packageItem?.name}</span>
                </div>
                <div className="text-slate-500">{packageItem?.version}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
