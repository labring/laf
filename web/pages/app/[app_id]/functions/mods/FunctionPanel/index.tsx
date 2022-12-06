/****************************
 * cloud functions list sidebar
 ***************************/

import React, { useRef, useState } from "react";
import { AiOutlineFilter } from "react-icons/ai";
import { DeleteIcon, EditIcon, HamburgerIcon, Search2Icon, SunIcon } from "@chakra-ui/icons";
import { HStack, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import useGlobalStore from "pages/globalStore";

import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import useFunctionStore, { TFunction } from "../../store";

import CreateModal from "./CreateModal";

export default function FunctionList() {
  const store = useFunctionStore((store) => store);
  const { showSuccess } = useGlobalStore();

  const [keywords, setKeywords] = useState("");
  const createModalRef = useRef<{
    edit: (item: TFunction) => void;
  }>();

  return (
    <Panel
      title={t`FunctionList`}
      actions={[
        // <IconWrap tooltip="dark mode" key="change_theme" onClick={() => {}}>
        //   <SunIcon fontSize={12} />
        // </IconWrap>,
        <CreateModal ref={createModalRef} key="create_modal" />,
        // <IconWrap key="options" onClick={() => {}}>
        //   <HamburgerIcon fontSize={12} />
        // </IconWrap>,
      ]}
    >
      <div className="border-b border-slate-300">
        <div className="flex items-center ml-2 mb-3">
          <InputGroup>
            <InputLeftElement
              height={"8"}
              width="12"
              pointerEvents="none"
              children={<Search2Icon bgSize="sm" color="gray.300" />}
            />
            <Input
              size="sm"
              className="mr-2"
              variant="filled"
              placeholder="输入函数名搜索"
              onChange={(event) => {
                setKeywords(event.target.value);
              }}
            />
          </InputGroup>
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

        <SectionList style={{ height: "calc(100vh - 400px)", overflowY: "auto" }}>
          {(store.allFunctionList || [])
            .filter((item: TFunction) => item?.name.includes(keywords))
            .map((func) => {
              return (
                <SectionList.Item
                  isActive={func?.name === store.currentFunction?.name}
                  key={func?.name || ""}
                  className="group"
                  onClick={() => {
                    store.setCurrentFunction(func);
                  }}
                >
                  <div>
                    <FileTypeIcon type={FileType.js} />
                    <span className="ml-2 text-black">{func?.name}</span>
                  </div>
                  <div className="hidden group-hover:block">
                    <EditIcon
                      fontSize={14}
                      color="gray.500"
                      _hover={{ color: "black" }}
                      onClick={() => {
                        createModalRef.current?.edit(func);
                      }}
                    />

                    <ConfirmButton
                      onSuccessAction={async () => {
                        const res = await store.deleteFunction(func);
                        if (!res.error) {
                          showSuccess("删除成功");
                        }
                      }}
                      headerText={"删除"}
                      bodyText={"确认要删除函数吗？"}
                    >
                      <DeleteIcon
                        className="ml-2"
                        fontSize={14}
                        color="gray.500"
                        _hover={{ color: "black" }}
                        onClick={() => {
                          createModalRef.current?.edit(func);
                        }}
                      />
                    </ConfirmButton>
                  </div>
                </SectionList.Item>
              );
            })}
        </SectionList>
      </div>
    </Panel>
  );
}
