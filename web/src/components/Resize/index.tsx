import { useEffect } from "react";
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
}) {
  const { type, pageId, panelId, reverse, containerRef } = props;
  const store = useCustomSettingStore();
  const { width, height, minWidth, maxWidth, minHeight, maxHeight, display } = store.getLayoutInfo(
    pageId,
    panelId,
  );
  const { isDragging, position, separatorProps } = useResizable({
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

  return (
    <>
      {display === "none" ? null : (
        <div
          className={
            type === "x" ? "group h-full w-2 cursor-col-resize" : "h-2 w-full cursor-row-resize"
          }
          {...separatorProps}
        >
          <Center className="relative h-full w-full">
            {type === "x" && width <= 20 ? (
              <div
                className={clsx(
                  reverse ? "rounded-l-lg" : "rounded-r-lg",
                  "h-[30px] w-2 bg-grayIron-300 leading-loose text-lafWhite-600 transition-colors group-hover:bg-grayIron-400",
                )}
              >
                {reverse ? <ChevronLeftIcon fontSize={10} /> : <ChevronRightIcon fontSize={10} />}
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
