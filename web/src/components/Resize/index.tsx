import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { page, panel } from "@/pages/customSetting";
import useCustomSettingStore from "@/pages/customSetting";
export default function Resize(props: {
  type: "row" | "col";
  reverse?: boolean;
  pageId: page;
  panelId: panel;
}) {
  const { type, pageId, panelId, reverse } = props;
  const store = useCustomSettingStore();
  const client = useRef({ clientX: 0, clientY: 0 });
  const [isResizing, setIsResizing] = useState(false);

  const handleStartResize = useCallback((e: React.MouseEvent<HTMLElement>) => {
    client.current = { clientX: e.clientX, clientY: e.clientY };
    setIsResizing(true);
  }, []);

  const handleStopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleResize = useCallback(
    (e: any) => {
      if (!isResizing) return;
      const { clientX, clientY } = client.current;
      const offset = {
        x: reverse ? clientX - e.clientX : e.clientX - clientX,
        y: reverse ? clientY - e.clientY : e.clientY - clientY,
      };
      client.current = { clientX: e.clientX, clientY: e.clientY };

      store.setLayoutInfo(pageId, panelId, offset);
    },
    [isResizing, reverse, store, pageId, panelId],
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleStopResize);
    document.addEventListener("mousemove", handleResize);
    return () => {
      document.removeEventListener("mouseup", handleStopResize);
      document.removeEventListener("mousemove", handleResize);
    };
  }, [handleStopResize, handleResize]);

  return (
    <>
      {type === "col" ? (
        <div className="h-full w-2 cursor-col-resize" onMouseDown={handleStartResize}></div>
      ) : (
        <div className="h-2 w-full cursor-row-resize" onMouseDown={handleStartResize}></div>
      )}
      {isResizing && (
        <div
          className={clsx(
            "fixed top-0 left-0 right-0 bottom-0 z-50 ",
            type === "col" ? " cursor-col-resize" : " cursor-row-resize",
          )}
        ></div>
      )}
    </>
  );
}
