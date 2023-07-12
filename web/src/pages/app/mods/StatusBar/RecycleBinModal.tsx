import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BiAddToQueue } from "react-icons/bi";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Checkbox,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import clsx from "clsx";

import { GoSelectIcon, RestoreIcon } from "@/components/CommonIcon";
// import Pagination from "@/components/Pagination";
import { formatDate } from "@/utils/format";

import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";

function FunctionItem({
  item,
  currentFunction,
  setCurrentFunction,
  selectedFunctionList,
  setSelectedFunctionList,
  showCheckBox,
}: any) {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const [showDelete, setShowDelete] = useState(false);
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "flex cursor-pointer items-center justify-between rounded px-3 py-2",
        darkMode ? "hover:bg-grayModern-800" : "hover:bg-primary-100",
        darkMode && currentFunction._id === item._id && "bg-grayModern-800",
        !darkMode && currentFunction._id === item._id && "bg-primary-100",
      )}
      onClick={() => {
        setCurrentFunction(item);
      }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {showCheckBox ? (
        <Checkbox
          onChange={() => {
            if (selectedFunctionList.includes(item._id)) {
              setSelectedFunctionList(selectedFunctionList.filter((id: string) => id !== item._id));
            } else {
              setSelectedFunctionList([...selectedFunctionList, item._id]);
            }
          }}
          className="text-grayIron-600"
          colorScheme="primary"
          isChecked={selectedFunctionList.includes(item._id)}
        >
          {item.name}
        </Checkbox>
      ) : (
        <span className="flex items-center text-[14px] text-grayIron-600">{item.name}</span>
      )}
      {showCheckBox ? (
        <span className="text-grayIron-600">{formatDate(item.createdAt)}</span>
      ) : !showDelete ? (
        <span className="text-grayIron-600">{formatDate(item.createdAt)}</span>
      ) : (
        <div className="flex">
          <div
            className="flex items-center text-grayModern-600 hover:text-grayModern-900"
            onClick={() => {
              console.log("delete", item.name);
            }}
          >
            <DeleteIcon className="mr-1" />
            {t("Delete")}
          </div>
          <div
            className="ml-3 flex items-center text-grayModern-600 hover:text-grayModern-900"
            onClick={() => {
              console.log("Restore", item.name);
            }}
          >
            <RestoreIcon fontSize={16} className="mr-1" />
            {t("Restore")}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecycleBinModal(props: { children: React.ReactElement }) {
  const function_Data = [
    {
      _id: "64ad08a10e95db0eb5fadbaa",
      appid: "k30w17",
      name: "abbba",
      source: {
        code: "import cloud from '@lafjs/cloud'\n\nexport default async function (ctx: FunctionContext) {\n  console.log('Hello World')\n  return { data: 'hi, laf' }\n}",
        compiled:
          "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nasync function default_1(ctx) {\n    console.log('Hello World');\n    return { data: 'hi, laf' };\n}\nexports.default = default_1;\n",
        version: 0,
      },
      desc: "",
      createdBy: "643cc1d400b685cb52d1daa2",
      methods: ["GET", "POST"],
      tags: [],
      createdAt: "2023-07-11T07:45:37.076Z",
      updatedAt: "2023-07-11T07:45:37.076Z",
    },
    {
      _id: "64ad08a10e95db0eb5fadbac",
      appid: "k30w17",
      name: "aaa",
      source: {
        code: "import cloud from '@lafjs/cloud'\n\nexport default async function (ctx: FunctionContext) {\n  console.log('Hello World')\n  return { data: 'hi, laf' }\n import cloud from '@lafjs/cloud'\n\nexport default async function (ctx: FunctionContext) {\n  console.log('Hello World')\n  return { data: 'hi, laf' }\n}",
        compiled:
          "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nasync function default_1(ctx) {\n    console.log('Hello World');\n    return { data: 'hi, laf' };\n}\nexports.default = default_1;\n",
        version: 0,
      },
      desc: "",
      createdBy: "643cc1d400b685cb52d1daa2",
      methods: ["GET", "POST"],
      tags: [],
      createdAt: "2023-07-11T07:45:37.076Z",
      updatedAt: "2023-07-11T07:45:37.076Z",
    },
  ];
  const { children } = props;
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const darkMode = useColorMode().colorMode === "dark";

  const [currentFunction, setCurrentFunction] = useState<any>(function_Data[0]);
  const [selectedFunctionList, setSelectedFunctionList] = useState<any>([]);
  const [showCheckBox, setShowCheckBox] = useState(false);

  return (
    <>
      {React.cloneElement(children, { onClick: onOpen })}
      <Modal isOpen={isOpen} onClose={onClose} size={"5xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("RecycleBin")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex">
              <Stack className="mr-3 h-[486px] w-[246px]" spacing={1}>
                <div
                  className={clsx(
                    "mb-2 flex h-[32px] cursor-pointer items-center justify-center rounded text-error-500",
                    darkMode ? "bg-grayModern-700" : "bg-[#F4F6F8]",
                  )}
                >
                  {t("ClearRecycleBin")}
                </div>
                {!showCheckBox ? (
                  <div
                    className={clsx(
                      "flex h-[32px] cursor-pointer items-center justify-center rounded",
                      darkMode
                        ? "bg-grayModern-700"
                        : "bg-[#F4F6F8] text-grayModern-600 hover:text-grayModern-800",
                    )}
                    onClick={() => setShowCheckBox(true)}
                  >
                    <GoSelectIcon />
                    <span className="ml-1">{t("Select")}</span>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      "flex h-[32px] cursor-pointer items-center justify-between rounded px-3",
                      darkMode ? "bg-grayModern-700" : "bg-[#F4F6F8] text-grayModern-600",
                    )}
                    onClick={() => setShowCheckBox(false)}
                  >
                    <div
                      className="flex cursor-pointer hover:text-grayModern-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedFunctionList.length === function_Data.length) {
                          setSelectedFunctionList([]);
                        } else {
                          setSelectedFunctionList(function_Data.map((item: any) => item._id));
                        }
                      }}
                    >
                      <BiAddToQueue fontSize={16} className="mr-1" />
                      <span>{t("CheckAll")}</span>
                    </div>
                    <div className="flex">
                      <div
                        className="flex cursor-pointer items-center hover:text-grayModern-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("delete", selectedFunctionList);
                        }}
                      >
                        <DeleteIcon className="mr-1" />
                        {t("Delete")}
                      </div>
                      <div
                        className="ml-3 flex cursor-pointer items-center hover:text-grayModern-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Restore", selectedFunctionList);
                        }}
                      >
                        <RestoreIcon fontSize={16} className="mr-1" />
                        {t("Restore")}
                      </div>
                    </div>
                  </div>
                )}
                {function_Data.map((item: any, index: number) => (
                  <FunctionItem
                    key={index}
                    item={item}
                    currentFunction={currentFunction}
                    setCurrentFunction={setCurrentFunction}
                    selectedFunctionList={selectedFunctionList}
                    setSelectedFunctionList={setSelectedFunctionList}
                    showCheckBox={showCheckBox}
                  />
                ))}
              </Stack>
              <div className="mr-6 h-[486px] flex-1">
                <MonacoEditor
                  value={currentFunction.source.code}
                  currentFunction={currentFunction}
                  readOnly={true}
                  title={currentFunction.name}
                  colorMode={useColorMode().colorMode}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}
