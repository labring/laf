import { useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Center } from "@chakra-ui/react";
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

  return (
    <>
      {display === "none" ? null : (
        <div
          className={
            type === "x" ? "h-full w-2 cursor-col-resize group" : "h-2 w-full cursor-row-resize"
          }
          {...separatorProps}
        >
          <Center className="w-full h-full relative">
            {type === "x" && width <= 20 ? (
              <div
                className={clsx(
                  reverse ? "rounded-l-lg" : "rounded-r-lg",
                  "w-2 h-[30px] bg-grayIron-300 group-hover:bg-grayIron-400 transition-colors leading-loose text-lafWhite-600",
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
                    isDragging ? " border-primary-400 border" : "",
                    "transition-all absolute z-10 overflow-hidden",
                  )}
                ></div>
                <div
                  className={clsx(
                    type === "x" ? "h-[18px]" : "w-[18px]",
                    " border rounded border-slate-300 absolute",
                  )}
                ></div>
              </>
            )}
          </Center>
        </div>
      )}
    </>
  );
}
