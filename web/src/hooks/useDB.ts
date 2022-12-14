import { Cloud } from "laf-client-sdk";

import useGlobalStore from "@/pages/globalStore";

function useDB() {
  const currentApp = useGlobalStore((state) => state.currentApp);
  const dbm_cloud = new Cloud({
    baseUrl: import.meta.env.VITE_SERVER_URL,
    dbProxyUrl: `/v1/apps/${currentApp?.appid}/databases/proxy`,
    getAccessToken: () => localStorage.getItem("token") as any,
  });

  const db = dbm_cloud.database();

  return { db };
}

export default useDB;
