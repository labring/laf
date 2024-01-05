import { RUNTIMES_PATH } from "@/constants";

function useFunctionCache() {
  const CACHE_KEY_PREFIX = "$cached_function@";

  function getCache(functionId: string, _default: string = ""): string {
    return localStorage.getItem(CACHE_KEY_PREFIX + functionId) || _default;
  }

  function setCache(functionId: string, value: string) {
    localStorage.setItem(CACHE_KEY_PREFIX + functionId, value);
  }

  function removeCache(functionId: string) {
    localStorage.removeItem(CACHE_KEY_PREFIX + functionId);
  }

  function getPositionCache(path: string, _default: string = ""): string {
    return localStorage.getItem(CACHE_KEY_PREFIX + path) || _default;
  }

  function setPositionCache(functionName: string, value: string) {
    localStorage.setItem(CACHE_KEY_PREFIX + `${RUNTIMES_PATH}/${functionName}.ts`, value);
  }

  return {
    getCache,
    setCache,
    removeCache,
    getPositionCache,
    setPositionCache,
  };
}

export default useFunctionCache;
