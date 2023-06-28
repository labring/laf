import { useCallback, useEffect } from "react";

const isWin = /windows/i.test(navigator.userAgent.toLowerCase());
const MODIFY_KEY = {
  // common meta key, support win & mac
  metaKey: isWin ? "Control" : "Meta",
  // shift key
  shiftKey: "Shift",
  // alt key
  altKey: "Alt",
  // control key
  ctrlKey: "Control",
};

export function getDisplayString(str: string) {
  return str.replace(/Meta/g, "⌘").replaceAll("Control", "Ctrl");
}

export const DEFAULT_SHORTCUTS = {
  send_request: [`${MODIFY_KEY.metaKey}+s`, `${MODIFY_KEY.metaKey}+r`],
  deploy: [`${MODIFY_KEY.metaKey}+p`],
};

export function getWhiteListKeys() {
  return ["s", "r", "p"];
}

function useHotKey(
  keyMap: string[],
  trigger: () => void,
  config: {
    enabled?: boolean;
  } = {
    enabled: true,
  },
): { displayName: string } {
  const handleKeyDown = useCallback(
    (event: any) => {
      if (getWhiteListKeys().indexOf(event.key) < 0) {
        return;
      }

      let _k: string[] = [];
      event.metaKey && _k.push(MODIFY_KEY.metaKey);
      event.ctrlKey && _k.push(MODIFY_KEY.ctrlKey);
      event.shiftKey && _k.push(MODIFY_KEY.shiftKey);
      event.altKey && _k.push(MODIFY_KEY.altKey);
      _k.push(event.key);

      if (keyMap.indexOf(_k.join("+")) >= 0) {
        event.preventDefault();
        trigger();
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

  return {
    displayName: getDisplayString(keyMap[0]),
  };
}

export default useHotKey;
