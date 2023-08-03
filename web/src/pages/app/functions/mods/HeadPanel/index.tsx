import { CopyIcon } from "@chakra-ui/icons";
import { CloseIcon } from "@chakra-ui/icons";
import { HStack, Input, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import CopyText from "@/components/CopyText";
import Panel from "@/components/Panel";
import { COLOR_MODE } from "@/constants";

import useFunctionStore from "../../store";

import FunctionDetailPopOver from "./FunctionDetailPopOver";

import useFunctionCache from "@/hooks/useFunctionCache";
import DeployButton from "@/pages/app/functions/mods/DeployButton";
import useCustomSettingStore from "@/pages/customSetting";

function HeadPanel() {
  const darkMode = useColorMode().colorMode === COLOR_MODE.dark;
  const functionPageConfig = useCustomSettingStore((store) => store.layoutInfo.functionPage);
  const {
    getFunctionUrl,
    recentFunctionList,
    setRecentFunctionList,
    currentFunction,
    setCurrentFunction,
  } = useFunctionStore((state) => state);
  const functionCache = useFunctionCache();

  return (
    <Panel className="h-9 !flex-row justify-between !px-0">
      <HStack className="light-scrollbar flex-1 overflow-hidden hover:overflow-auto">
        <div className="flip flex h-full ">
          {recentFunctionList.length > 0 &&
            recentFunctionList.map((item, index) => {
              return (
                <div
                  key={index}
                  className={clsx(
                    "group relative !ml-0 flex h-full w-28 cursor-pointer items-center border-[#EEF0F2] px-3 font-medium ",
                    currentFunction?._id === item._id
                      ? "text-grayModern-900"
                      : "border-b-[2px] border-[#EEF0F2] text-grayModern-600",
                    currentFunction?._id === item._id && index === 0 && "border-r-[2px]",
                    currentFunction?._id === item._id && index !== 0 && "border-x-[2px]",
                  )}
                  onClick={() => setCurrentFunction(item)}
                >
                  <p className="w-20 truncate">{item.name}</p>
                  <FunctionDetailPopOver functionItem={item} />
                  {functionCache.getCache(item?._id, (item as any)?.source?.code) !==
                  (item as any)?.source?.code ? (
                    <span className="ml-1 inline-block h-1 w-1 flex-none rounded-full bg-rose-500 group-hover:hidden"></span>
                  ) : (
                    <span className="ml-1 inline-block h-1 w-1 flex-none rounded-full bg-none group-hover:hidden"></span>
                  )}
                  <span className="hidden group-hover:flex">
                    <CloseIcon
                      boxSize="2"
                      className="!text-grayModern-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecentFunctionList(recentFunctionList.filter((i) => i._id !== item._id));
                        if (currentFunction?._id === item._id) {
                          setCurrentFunction(
                            recentFunctionList[index + 1] || recentFunctionList[0] || {},
                          );
                        }
                      }}
                    />
                  </span>
                </div>
              );
            })}
        </div>
        <div className="flip !ml-0 flex h-full flex-1 border-b-[2px] border-[#EEF0F2]"></div>
      </HStack>
      <HStack
        minW="314px"
        width={`${functionPageConfig.RightPanel.style.width}px`}
        className="flex justify-end border-b-[2px] border-[#EEF0F2] pr-2"
      >
        <DeployButton />
        <div className={clsx("flex items-center", !darkMode && "bg-[#F6F8F9]")}>
          <CopyText text={getFunctionUrl()}>
            <Input w={"200px"} size="xs" readOnly value={getFunctionUrl()} />
          </CopyText>
          <CopyText text={getFunctionUrl()} className="mr-3 cursor-pointer !text-grayModern-300">
            <CopyIcon />
          </CopyText>
        </div>
      </HStack>
    </Panel>
  );
}

export default HeadPanel;
