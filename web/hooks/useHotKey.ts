import { useCallback, useEffect } from "react";

function useHotKey(keyMap: string, trigger: () => void) {
  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === keyMap && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();

        // remove test log when api called
        trigger();
      }
    },
    [keyMap, trigger],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyDown);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return "⌘" + keyMap;
}

export default useHotKey;
