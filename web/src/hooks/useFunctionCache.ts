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

  return {
    getCache,
    setCache,
    removeCache,
  };
}

export default useFunctionCache;
