import { useEffect } from "react";
import { AiFillHeart } from "react-icons/ai";
import { Outlet } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";

import Warn from "./RealNameWarn";

import Header from "@/layouts/Header";
import useAuthStore from "@/pages/auth/store";
import useGlobalStore from "@/pages/globalStore";
import useSiteSettingStore from "@/pages/siteSetting";

export default function BasicLayout() {
  const { init, loading, userInfo } = useGlobalStore((state) => state);
  const { siteSettings } = useSiteSettingStore((state) => state);
  const { phoneProvider } = useAuthStore((state) => ({
    phoneProvider: state.phoneProvider,
  }));

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <Header className="m-auto max-w-screen-xl" />
      <div className="pb-10">
        {loading ? (
          <Center style={{ minHeight: 500 }}>
            <Spinner />
          </Center>
        ) : (
          <>
            {siteSettings.id_verify?.value === "on" &&
              !userInfo?.profile?.idVerified?.isVerified &&
              phoneProvider && <Warn />}
            <Outlet />
          </>
        )}
      </div>
      <div className="fixed bottom-0 -z-10 w-full py-4 text-center">
        Made with <AiFillHeart className="inline text-red-500" /> by laf team
      </div>
    </div>
  );
}
