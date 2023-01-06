import { useCallback, useEffect, useRef } from "react";

import { getWhiteList, stringToCode } from "@/utils/hotKeyMap";
function useHotKey(
  keyMap: string[],
  trigger: () => void,
  config: {
    enabled?: boolean;
  } = {
    enabled: true,
  },
) {
  const downKeys = useRef<Set<Number>>(new Set());
  const upKeys = useRef<Set<Number>>(new Set());

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.repeat) {
        return;
      }
      if ((event.ctrlKey || event.metaKey) && getWhiteList().indexOf(event.keyCode) === -1) {
        event.preventDefault();
      }
      downKeys.current.add(event.keyCode);
    },
    [downKeys],
  );

  const handleKeyUp = useCallback(
    (event: any) => {
      upKeys.current.add(event.keyCode);
      const size = downKeys.current.size;
      if (upKeys.current.size >= size) {
        let isMatch = false;
        for (let i = 0; i < keyMap.length && !isMatch; i++) {
          const targetKey = keyMap[i].split("+").map((item) => stringToCode(item));
          if (targetKey.length !== size) continue;
          let count = size;
          for (let item of targetKey) {
            if (downKeys.current.has(item)) count--;
          }
          isMatch = count === 0;
        }
        if (isMatch) {
          trigger();
        }
        downKeys.current.clear();
        upKeys.current.clear();
      }
    },
    [keyMap, trigger, downKeys, upKeys],
  );

  useEffect(() => {
    // attach the event listener
    if (config?.enabled) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    }

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [config?.enabled, handleKeyDown, handleKeyUp]);
}

export default useHotKey;
