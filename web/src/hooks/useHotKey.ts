import { useCallback, useEffect } from "react";

function useHotKey(
  keyMap: string,
  trigger: () => void,
  config: {
    enabled?: boolean;
  } = {
    enabled: true,
  },
) {
  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === keyMap && (event.ctrlKey || event.metaKey)) {
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

  return "⌘" + keyMap;
}

export default useHotKey;
