/****************************
 * cloud functions list sidebar
 ***************************/

import React from "react";
import { ChevronRightIcon, HamburgerIcon, Search2Icon, SunIcon } from "@chakra-ui/icons";
import { HStack, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { AiOutlineFilter } from "react-icons/ai";

import useFunctionStore from "../../store";

import CreateModal from "./CreateModal";

import commonStyles from "../../../index.module.scss";
import styles from "./index.module.scss";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import FileStatusIcon, { FileStatus } from "@/components/FileStatusIcon";
import IconWrap from "@/components/IconWrap";

export default function FunctionList() {
  const store = useFunctionStore((store) => store);

  return (
    <div>
      <div className={commonStyles.sectionHeader + " flex justify-between"}>
        <h4>
          <ChevronRightIcon fontSize={16} />
          {t`FunctionList`}
        </h4>
        <HStack spacing="0">
          <IconWrap onClick={() => {}}>
            <SunIcon fontSize={12} />
          </IconWrap>
          <CreateModal />
          <IconWrap onClick={() => {}}>
            <HamburgerIcon fontSize={12} />
          </IconWrap>
        </HStack>
      </div>
      <div className="flex items-center m-2 mb-2">
        <InputGroup>
          <InputLeftElement
            height={"8"}
            width="12"
            pointerEvents="none"
            children={<Search2Icon bgSize="sm" color="gray.300" />}
          />
          <Input size="sm" className="mr-2" variant="filled" placeholder="输入函数名搜索" />
        </InputGroup>

        <HStack spacing="2">
          <IconWrap onClick={() => {}} size={26}>
            <AiOutlineFilter size={16} />
          </IconWrap>
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

      <h5 className="m-4">所有函数</h5>
      <ul className={styles.functionList + " mb-4"}>
        {(store.allFunctionList || []).map((func: any) => {
          return (
            <li
              className={func._id === store.currentFunction?._id ? styles.active : ""}
              key={func._id}
              onClick={() => {
                store.setCurrentFunction(func);
              }}
            >
              <div>
                <FileTypeIcon type={FileType.js} />
                <span className="ml-2">{func.label}</span>
              </div>
              <FileStatusIcon status={FileStatus.deleted} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
