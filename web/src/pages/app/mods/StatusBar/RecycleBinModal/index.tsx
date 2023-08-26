import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiAddToQueue } from "react-icons/bi";
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
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import { GoSelectIcon, RecycleDeleteIcon, RestoreIcon } from "@/components/CommonIcon";
import Pagination from "@/components/Pagination";
import { formatDate } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import {
  useDeleteRecycleBinItemsMutation,
  useEmptyRecycleBinMutation,
  useGetRecycleBinQuery,
  useRestoreRecycleBinItemsMutation,
} from "./service";

import { TFunction, TFunctionList } from "@/apis/typing";
import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";
import useGlobalStore from "@/pages/globalStore";

const defaultQuery = {
  page: 1,
  pageSize: 9,
};

function FunctionItem({
  item,
  currentFunction,
  setCurrentFunction,
  selectedFunctionList,
  setSelectedFunctionList,
  showCheckBox,
  FunctionQuery,
}: any) {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const [showDelete, setShowDelete] = useState(false);
  const { t } = useTranslation();
  const { showSuccess } = useGlobalStore();
  const queryClient = useQueryClient();
  const deleteRecycleBinItemsMutation = useDeleteRecycleBinItemsMutation();
  const restoreRecycleBinItemsMutation = useRestoreRecycleBinItemsMutation();

  return (
    <div
      className={clsx("flex cursor-pointer items-center justify-between rounded px-3 py-2", {
        "hover:bg-grayModern-800": darkMode,
        "hover:bg-primary-100": !darkMode,
        "bg-grayModern-800": darkMode && currentFunction._id === item._id,
        "bg-primary-100": !darkMode && currentFunction._id === item._id,
      })}
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
          className="overflow-hidden text-grayIron-600"
          colorScheme="primary"
          isChecked={selectedFunctionList.includes(item._id)}
        >
          {item.name}
        </Checkbox>
      ) : (
        <span className="mr-2 flex items-center overflow-hidden text-[14px] text-grayIron-600">
          <p className="truncate">{item.name}</p>
        </span>
      )}
      {showCheckBox ? (
        <span className="whitespace-nowrap text-grayIron-600">{formatDate(item.createdAt)}</span>
      ) : !showDelete ? (
        <span className="whitespace-nowrap text-grayIron-600">{formatDate(item.createdAt)}</span>
      ) : (
        <div className="flex">
          <div
            className="flex items-center whitespace-nowrap text-grayModern-600 hover:text-grayModern-900"
            onClick={async () => {
              const res = await deleteRecycleBinItemsMutation.mutateAsync({ ids: [item._id] });
              if (!res.error) {
                setSelectedFunctionList([]);
                FunctionQuery();
                showSuccess(t("DeleteSuccess"));
              }
            }}
          >
            <RecycleDeleteIcon className="mr-1 text-lg" />
            {t("Delete")}
          </div>
          <div
            className="ml-3 flex items-center whitespace-nowrap text-grayModern-600 hover:text-grayModern-900"
            onClick={async () => {
              const res = await restoreRecycleBinItemsMutation.mutateAsync({ ids: [item._id] });
              if (!res.error) {
                setSelectedFunctionList([]);
                FunctionQuery();
                showSuccess(t("RestoreSuccess"));
                queryClient.invalidateQueries(["useFunctionListQuery"]);
              }
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
  const { children } = props;
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess, showError, showInfo } = useGlobalStore();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [functionListData, setFunctionListData] = useState<TFunctionList>();
  const [currentFunction, setCurrentFunction] = useState<TFunction>();
  const [selectedFunctionList, setSelectedFunctionList] = useState<string[]>([]);
  const [showCheckBox, setShowCheckBox] = useState(false);
  const [queryData, setQueryData] = useState(defaultQuery);
  const [enable, setEnable] = useState(false);

  const queryClient = useQueryClient();
  const deleteRecycleBinItemsMutation = useDeleteRecycleBinItemsMutation();
  const restoreRecycleBinItemsMutation = useRestoreRecycleBinItemsMutation();
  const emptyRecycleBinMutation = useEmptyRecycleBinMutation();

  const FunctionQuery = () => {
    setEnable(true);
    queryClient.invalidateQueries(["useGetRecycleBin"]);
  };

  useGetRecycleBinQuery(
    {
      ...queryData,
    },
    {
      enabled: enable,
      onSuccess: (data) => {
        setFunctionListData(data.data);
        setCurrentFunction(data.data.list[0]);
        setEnable(false);
        if (data.data.total === 0) {
          onClose();
          showInfo(t("RecycleBinEmpty"));
        }
      },
    },
  );

  useEffect(() => {
    if (functionListData && functionListData?.list.length > 0) {
      onOpen();
    }
  }, [functionListData, onOpen, enable]);

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          FunctionQuery();
        },
      })}
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
                    "mb-2 flex min-h-[32px] cursor-pointer items-center justify-center rounded text-error-500",
                    darkMode ? "bg-grayModern-700" : "bg-[#F4F6F8]",
                  )}
                  onClick={async () => {
                    const res = await emptyRecycleBinMutation.mutateAsync({});
                    if (!res.error) {
                      setSelectedFunctionList([]);
                      FunctionQuery();
                      showSuccess(t("EmptySuccess"));
                      onClose();
                    }
                  }}
                >
                  {t("ClearRecycleBin")}
                </div>
                {!showCheckBox ? (
                  <div
                    className={clsx(
                      "flex min-h-[32px] cursor-pointer items-center justify-center rounded",
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
                      "flex min-h-[32px] cursor-pointer items-center justify-between rounded px-3",
                      darkMode ? "bg-grayModern-700" : "bg-[#F4F6F8] text-grayModern-600",
                    )}
                    onClick={() => setShowCheckBox(false)}
                  >
                    <div
                      className="flex cursor-pointer hover:text-grayModern-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedFunctionList.length === functionListData?.list.length) {
                          setSelectedFunctionList([]);
                        } else {
                          functionListData &&
                            setSelectedFunctionList(
                              functionListData?.list.map((item: TFunction) => item._id),
                            );
                        }
                      }}
                    >
                      <BiAddToQueue fontSize={16} className="mr-1" />
                      <span>{t("CheckAll")}</span>
                    </div>
                    <div className="flex">
                      <div
                        className="flex cursor-pointer items-center hover:text-grayModern-900"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (selectedFunctionList.length === 0) {
                            showError(t("SelectOne"));
                          } else {
                            const res = await deleteRecycleBinItemsMutation.mutateAsync({
                              ids: selectedFunctionList,
                            });
                            if (!res.error) {
                              setSelectedFunctionList([]);
                              FunctionQuery();
                              showSuccess(t("DeleteSuccess"));
                            }
                          }
                        }}
                      >
                        <RecycleDeleteIcon className="mr-1 text-lg" />
                        {t("Delete")}
                      </div>
                      <div
                        className="ml-3 flex cursor-pointer items-center hover:text-grayModern-900"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (selectedFunctionList.length === 0) {
                            showError(t("SelectOne"));
                          } else {
                            const res = await restoreRecycleBinItemsMutation.mutateAsync({
                              ids: selectedFunctionList,
                            });
                            if (!res.error) {
                              setSelectedFunctionList([]);
                              FunctionQuery();
                              showSuccess(t("RestoreSuccess"));
                              queryClient.invalidateQueries(["useFunctionListQuery"]);
                            }
                          }
                        }}
                      >
                        <RestoreIcon fontSize={16} className="mr-1" />
                        {t("Restore")}
                      </div>
                    </div>
                  </div>
                )}
                {functionListData &&
                  functionListData?.list.map((item: TFunction, index: number) => (
                    <FunctionItem
                      key={index}
                      item={item}
                      currentFunction={currentFunction}
                      setCurrentFunction={setCurrentFunction}
                      selectedFunctionList={selectedFunctionList}
                      setSelectedFunctionList={setSelectedFunctionList}
                      showCheckBox={showCheckBox}
                      FunctionQuery={FunctionQuery}
                    />
                  ))}
                {functionListData && (
                  <div className="absolute bottom-12 left-8">
                    <Pagination
                      values={getPageInfo(functionListData)}
                      onChange={(values: any) => {
                        setEnable(true);
                        setQueryData({
                          page: values.page,
                          pageSize: values.pageSize,
                        });
                      }}
                      notShowSelect
                    />
                  </div>
                )}
              </Stack>
              <div className="mr-6 h-[486px] flex-1">
                {currentFunction && (
                  <MonacoEditor
                    value={currentFunction?.source.code}
                    currentFunction={currentFunction}
                    readOnly={true}
                    title={currentFunction?.name}
                    colorMode={colorMode}
                  />
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}
