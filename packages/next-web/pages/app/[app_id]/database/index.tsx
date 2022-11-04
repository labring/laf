/****************************
 * cloud functions database page
 ***************************/
import IconWrap from "@/components/IconWrap";
import { ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { HStack, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React from "react";

import commonStyles from "../index.module.scss";
import CreateModal from "../functions/mods/FunctionPanel/CreateModal";
import { AiOutlineFilter } from "react-icons/ai";
import FileStatusIcon, { FileStatus } from "@/components/FileStatusIcon";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import useFunctionStore from "../functions/store";

import styles from "./index.module.scss";

function DatabasePage() {
  const store = useFunctionStore((store) => store);
  return (
    <div>
      <div style={{ width: 300, borderRight: "1px solid #eee" }}>
        <div className={commonStyles.sectionHeader + " flex justify-between"}>
          <h4>
            <ChevronDownIcon fontSize={16} />
            集合列表
          </h4>
          <HStack spacing="0">
            <CreateModal />
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
            <Input size="sm" className="mr-2" variant="filled" placeholder="输入集合名称搜索" />
          </InputGroup>

          <HStack spacing="2">
            <IconWrap onClick={() => {}} size={26}>
              <AiOutlineFilter size={16} />
            </IconWrap>
          </HStack>
        </div>

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
    </div>
  );
}

export default DatabasePage;
