import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Center, useColorModeValue } from "@chakra-ui/react";
import clsx from "clsx";

import useResizable from "@/hooks/useResizable";
import { page, panel } from "@/pages/customSetting";
import useCustomSettingStore from "@/pages/customSetting";
export default function Resize(props: {
  type: "x" | "y";
  reverse?: boolean;
  pageId: page;
  panelId: panel;
  containerRef: any;
  lineWidth?: number;
}) {
  const { type, pageId, panelId, reverse, containerRef, lineWidth = 2 } = props;
  const store = useCustomSettingStore();
  const { width, height, minWidth, maxWidth, minHeight, maxHeight, display } =
    store.getLayoutInfoStyle(pageId, panelId);
  const { isDragging, position, separatorProps, handleClick } = useResizable({
    axis: type,
    initial: type === "x" ? width : height,
    min: type === "x" ? minWidth : minHeight,
    max: type === "x" ? maxWidth : maxHeight,
    reverse,
    containerRef,
  });
  useEffect(() => {
    const newPosition = {
      width: position,
      height: position,
    };

    store.setLayoutInfo(pageId, panelId, newPosition);
  }, [position, pageId, panelId, store]);
  const borderColor = useColorModeValue("slate.300", "lafDark.300");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {display === "none" ? null : (
        <div
          className={type === "x" ? "group cursor-col-resize" : "cursor-row-resize"}
          style={
            type === "x"
              ? { width: lineWidth, height: "100%" }
              : { width: "100%", height: lineWidth }
          }
          {...separatorProps}
        >
          <Center className="relative h-full w-full">
            {type === "x" && width <= minWidth + 15 ? (
              <div
                className={clsx(
                  "absolute z-50 cursor-pointer",
                  !isCollapsed && !reverse && "mr-2 rounded-l-full",
                  isCollapsed && !reverse && "ml-2 rounded-r-full",
                  !isCollapsed && reverse && "ml-2 rounded-r-full",
                  isCollapsed && reverse && "mr-2 rounded-l-full",
                  "h-[30px] w-2 bg-grayIron-300 leading-loose text-lafWhite-600 transition-colors group-hover:bg-grayIron-400",
                )}
                onClick={(e) => {
                  handleClick(e, isCollapsed);
                  setIsCollapsed(!isCollapsed);
                }}
              >
                {!isCollapsed && !reverse && <ChevronLeftIcon fontSize={10} />}
                {isCollapsed && !reverse && <ChevronRightIcon fontSize={10} />}
                {!isCollapsed && reverse && <ChevronRightIcon fontSize={10} />}
                {isCollapsed && reverse && <ChevronLeftIcon fontSize={10} />}
              </div>
            ) : (
              <>
                <div
                  className={clsx(
                    type === "x" && isDragging ? "h-full " : "h-0",
                    type === "y" && isDragging ? "w-full " : "w-0",
                    isDragging ? " border border-primary-400" : "",
                    "absolute z-10 overflow-hidden transition-all",
                  )}
                ></div>
                <Box
                  borderColor={borderColor}
                  className={clsx(
                    type === "x" ? "h-[18px]" : "w-[18px]",
                    "absolute rounded border",
                  )}
                ></Box>
              </>
            )}
          </Center>
        </div>
      )}
    </>
  );
}
