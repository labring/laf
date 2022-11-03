/****************************
 * cloud functions list sidebar
 ***************************/

import React from "react";
import {
  AttachmentIcon,
  HamburgerIcon,
  SettingsIcon,
  SunIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { HStack, Input } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import request from "@/utils/request";

import useFunctionStore from "../../store";
import CreateModal from "../CreateModal";

import commonStyles from "../../index.module.scss";
import styles from "./index.module.scss";

export default function FunctionList() {
  const store = useFunctionStore((store) => store);

  const { data } = useQuery(["functions"], () => {
    return request.get("/api/function_list");
  });

  console.log(123, data);

  return (
    <div>
      <div className={commonStyles.sectionHeader + " flex justify-between"}>
        <h4 className="m-2">函数列表</h4>
        <HStack spacing="2">
          <SunIcon />
          <CreateModal />
          <HamburgerIcon />
        </HStack>
      </div>
      <div className="flex items-center m-2 mb-2">
        <Input size="sm" className="mr-2" />
        <HStack spacing="2">
          <WarningIcon />
          <SettingsIcon />
        </HStack>
      </div>

      {/* <h5 className="m-2">我的收藏</h5>
      <ul className={styles.functionList + " mb-4"}>
        {(data?.data || []).map((func: any) => {
          return (
            <li
              key={func.id}
              onClick={() => {
                store.setCurrentFunction(func.id);
              }}
            >
              <div>
                <AttachmentIcon />
                <span className="ml-2">{func.name}.js</span>
              </div>
              <div className={styles.status}>M</div>
            </li>
          );
        })}
      </ul> */}

      <h5 className="m-2">所有函数</h5>
      <ul className={styles.functionList + " mb-4"}>
        {(data?.data || []).map((func: any) => {
          return (
            <li
              className={func.id === store.currentFunction ? styles.active : ""}
              key={func._id}
              onClick={() => {
                store.setCurrentFunction(func._id);
              }}
            >
              <div>
                <AttachmentIcon />
                <span className="ml-2">{func.name}.js</span>
              </div>
              <div className={styles.status}>M</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
