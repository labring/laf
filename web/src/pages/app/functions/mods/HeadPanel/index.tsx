import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";
import { HStack, Input, Tooltip, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import SimpleBar from "simplebar-react";

import { CopyIcon, EditIconFull } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import { COLOR_MODE, Pages } from "@/constants";

import useFunctionStore from "../../store";

import FunctionDetailPopOver from "./FunctionDetailPopOver";

import "./index.css";

import useFunctionCache from "@/hooks/useFunctionCache";
import CollaborateButton from "@/pages/app/collaboration/CollaborateButton";
import DeployButton from "@/pages/app/functions/mods/DeployButton";
import SysSetting from "@/pages/app/setting/SysSetting";
import useGlobalStore from "@/pages/globalStore";

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
  const navigate = useNavigate();
  const { currentApp } = useGlobalStore();

  useEffect(() => {
    const element = document.getElementById("reverse_scroll");
    if (element) {
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        const elementToScroll = element.querySelector(".simplebar-content-wrapper");
        elementToScroll?.scrollTo({
          left: elementToScroll.scrollLeft + event.deltaY / 2,
        });
      };
      element.addEventListener("wheel", handleWheel);
      return () => {
        element.removeEventListener("wheel", handleWheel);
      };
    }
  }, []);

  return (
    <Panel className="recentList !flex-row justify-between !px-0">
      <SimpleBar style={{ flex: 1, overflowY: "hidden" }} id="reverse_scroll">
        <HStack className="flex-1 flex-nowrap" height="36px" data-simplebar>
          <div className="flex h-full">
            {recentFunctionList.length > 0 &&
              recentFunctionList.map((item, index) => {
                const selected = currentFunction?._id === item._id;
                const isLast = recentFunctionList.length <= 1;
                return (
                  <div
                    key={index}
                    className={clsx(
                      "group !ml-0 flex h-full w-28 cursor-pointer items-center justify-between border-y-[2px] px-3 text-[13px] font-medium",
                      darkMode ? "border-[#1A202C]" : "border-[#EEF0F2]",
                      selected
                        ? "border-b-transparent border-t-primary-600 text-primary-700"
                        : darkMode
                        ? "border-t-lafDark-200 text-grayModern-400"
                        : "border-t-lafWhite-200 text-grayModern-600",
                      selected
                        ? index === 0
                          ? "border-r-[2px]"
                          : "border-x-[2px]"
                        : index === 0
                        ? "pr-[14px]"
                        : "px-[14px]",
                    )}
                    onClick={() => {
                      navigate(`/app/${currentApp?.appid}/${Pages.function}/${item?.name}`, {
                        replace: true,
                      });
                      setCurrentFunction(item);
                    }}
                  >
                    <div className="flex max-w-20 truncate">
                      <FunctionDetailPopOver
                        functionItem={item}
                        color={selected ? "#00A9A6" : ""}
                      />
                      <Tooltip label={item.name} placement="auto">
                        <p className="truncate">{item.name.split("/").pop()}</p>
                      </Tooltip>
                    </div>
                    {functionCache.getCache(item?._id, (item as any)?.source?.code) !==
                    (item as any)?.source?.code ? (
                      <span
                        className={clsx(
                          "ml-2 inline-block h-1 w-1 flex-none rounded-full bg-rose-500",
                          !isLast ? "group-hover:hidden" : "",
                        )}
                      ></span>
                    ) : (
                      <span className="ml-2 inline-block h-1 w-1 flex-none rounded-full bg-none group-hover:hidden"></span>
                    )}
                    <span className={clsx(!isLast ? "-mr-1 hidden group-hover:flex" : "hidden")}>
                      <IconWrap
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecentFunctionList(
                            recentFunctionList.filter((i) => i._id !== item._id),
                          );
                          if (currentFunction?._id === item._id) {
                            const nextFunction =
                              recentFunctionList[index + 1] || recentFunctionList[0] || {};
                            setCurrentFunction(nextFunction);
                            navigate(
                              `/app/${currentApp?.appid}/${Pages.function}/${nextFunction.name}`,
                              { replace: true },
                            );
                          }
                        }}
                      >
                        <CloseIcon boxSize="2" className="!text-grayModern-600" />
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
        height="36px"
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
            <div className={clsx("flex items-center pl-1", !darkMode && "bg-[#F6F8F9]")}>
              <CopyText text={getFunctionUrl()}>
                <Input w={"200px"} size="xs" readOnly value={getFunctionUrl()} />
              </CopyText>
              <CopyText
                text={getFunctionUrl()}
                className="mr-2 cursor-pointer !text-grayModern-300"
                hideToolTip
              >
                <span>
                  <CopyIcon color="#BDC1C5" size={14} />
                </span>
              </CopyText>
              <SysSetting currentTab="domain">
                <span className="mr-2 flex cursor-pointer items-center text-lg !text-grayModern-300">
                  <EditIconFull />
                </span>
              </SysSetting>
            </div>
          </>
        )}
      </HStack>
    </Panel>
  );
}

export default HeadPanel;
