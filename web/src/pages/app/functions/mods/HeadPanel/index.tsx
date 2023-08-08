import { useTranslation } from "react-i18next";
import { CopyIcon, EditIcon } from "@chakra-ui/icons";
import { CloseIcon } from "@chakra-ui/icons";
import { HStack, Input, Tooltip, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import SimpleBar from "simplebar-react";

import CopyText from "@/components/CopyText";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import { COLOR_MODE } from "@/constants";

import useFunctionStore from "../../store";

import FunctionDetailPopOver from "./FunctionDetailPopOver";

import useFunctionCache from "@/hooks/useFunctionCache";
import CollaborateButton from "@/pages/app/collaboration/CollaborateButton";
import DeployButton from "@/pages/app/functions/mods/DeployButton";
import SysSetting from "@/pages/app/setting/SysSetting";

function HeadPanel() {
  const darkMode = useColorMode().colorMode === COLOR_MODE.dark;
  const {
    getFunctionUrl,
    recentFunctionList,
    setRecentFunctionList,
    currentFunction,
    setCurrentFunction,
  } = useFunctionStore((state) => state);
  const functionCache = useFunctionCache();
  const { t } = useTranslation();

  return (
    <Panel className="!flex-row justify-between bg-grayModern-200 !px-0">
      <SimpleBar style={{ height: 36, flex: 1, overflowY: "hidden" }}>
        <HStack className="h-9 flex-1" data-simplebar>
          <div className="flex h-full ">
            {recentFunctionList.length > 0 &&
              recentFunctionList.map((item, index) => {
                const selected = currentFunction?._id === item._id;
                return (
                  <div
                    key={index}
                    className={clsx(
                      "group !ml-0 flex h-full w-28 cursor-pointer items-center justify-between border-b-[2px] px-3 font-medium",
                      darkMode ? "border-[#1A202C]" : "border-[#EEF0F2]",
                      selected ? "border-b-transparent" : "text-grayModern-600",
                      selected
                        ? index === 0
                          ? "border-r-[2px]"
                          : "border-x-[2px]"
                        : index === 0
                        ? "pr-[14px]"
                        : "px-[14px]",
                    )}
                    onClick={() => setCurrentFunction(item)}
                  >
                    <div className="max-w-20 flex truncate">
                      <FunctionDetailPopOver functionItem={item} />
                      <p className="truncate">{item.name}</p>
                    </div>
                    {functionCache.getCache(item?._id, (item as any)?.source?.code) !==
                    (item as any)?.source?.code ? (
                      <span className="ml-1 inline-block h-1 w-1 flex-none rounded-full bg-rose-500 group-hover:hidden"></span>
                    ) : (
                      <span className="ml-1 inline-block h-1 w-1 flex-none rounded-full bg-none group-hover:hidden"></span>
                    )}
                    <span className="hidden group-hover:flex">
                      <IconWrap className="!w-2">
                        <CloseIcon
                          boxSize="2"
                          className="!text-grayModern-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecentFunctionList(
                              recentFunctionList.filter((i) => i._id !== item._id),
                            );
                            if (currentFunction?._id === item._id) {
                              setCurrentFunction(
                                recentFunctionList[index + 1] || recentFunctionList[0] || {},
                              );
                            }
                          }}
                        />
                      </IconWrap>
                    </span>
                  </div>
                );
              })}
          </div>
          <div
            className={clsx(
              "!ml-0 flex h-full flex-1 border-b-[2px] ",
              !darkMode ? "border-[#EEF0F2] " : "border-[#1A202C]",
            )}
          ></div>
        </HStack>
      </SimpleBar>
      <HStack
        minW="500px"
        // width={`${functionPageConfig.RightPanel.style.width}px`}
        className={clsx(
          "flex justify-end border-b-[2px] pr-2",
          !darkMode ? "border-[#EEF0F2] " : "border-[#1A202C]",
        )}
        spacing={3}
      >
        <CollaborateButton />
        {!!currentFunction._id && (
          <>
            <DeployButton />
            <div className={clsx("flex items-center", !darkMode && "bg-[#F6F8F9]")}>
              <CopyText text={getFunctionUrl()}>
                <Input w={"200px"} size="xs" readOnly value={getFunctionUrl()} />
              </CopyText>
              <SysSetting currentTab="domain">
                <span className="flex items-center">
                  <Tooltip label={String(t("Edit"))}>
                    <EditIcon className="mr-3 cursor-pointer !text-grayModern-300" />
                  </Tooltip>
                </span>
              </SysSetting>
              <CopyText
                text={getFunctionUrl()}
                className="mr-3 cursor-pointer !text-grayModern-300"
              >
                <CopyIcon />
              </CopyText>
            </div>
          </>
        )}
      </HStack>
    </Panel>
  );
}

export default HeadPanel;
