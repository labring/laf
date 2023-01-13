import useFunctionStore from "@/pages/app/functions/store";

function useFunctionCache() {
  const CACHE_KEY_PREFIX = "$cached_function@";

  const currentFunction = useFunctionStore((state) => state.currentFunction);

  function getCache(functionId: string): string {
    return (
      localStorage.getItem(CACHE_KEY_PREFIX + functionId) || currentFunction?.source?.code || ""
    );
  }

  function setCache(functionId: string, value: string) {
    localStorage.setItem(CACHE_KEY_PREFIX + functionId, value);
  }

  function removeCache(functionId: string) {
    localStorage.removeItem(CACHE_KEY_PREFIX + functionId);
  }

  return {
    getCache,
    setCache,
    removeCache,
  };
}

export default useFunctionCache;
