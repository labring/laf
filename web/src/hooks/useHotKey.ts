import { useCallback, useEffect, useRef } from "react";

import { formatHotKeyModifier } from "@/utils/format";
function useHotKey(
  keyMap: string[],
  trigger: () => void,
  config: {
    enabled?: boolean;
  } = {
    enabled: true,
  },
) {
  const pressKey = useRef<any>(null);
  const timeout = useRef<any>(null);

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.repeat) {
        return;
      }
      if (keyMap.indexOf(event.key) > -1 && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        pressKey.current = event.key;
        if (timeout.current === null) {
          timeout.current = setTimeout(() => {
            // trigger the event if there is no change within 100ms
            if (pressKey.current === event.key) {
              trigger();
            }
            clearTimeout(timeout.current);
            timeout.current = null;
            pressKey.current = null;
          }, 100);
        }
      }
    },
    [keyMap, trigger],
  );

  useEffect(() => {
    // attach the event listener
    if (config?.enabled) {
      document.addEventListener("keydown", handleKeyDown);
    }

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [config?.enabled, handleKeyDown]);

  // return shortcut key text ,if keyMap has more than two items will format [../..]
  const res = `${formatHotKeyModifier()} + 
      ${
        keyMap.length > 1
          ? "[" + keyMap.map((item) => item.toUpperCase()).join("/") + "]"
          : keyMap[0].toUpperCase()
      }`;

  return res;
}

export default useHotKey;
