import { useCallback, useEffect } from "react";
import { AiFillHeart } from "react-icons/ai";
import { Outlet } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";

import i18n from "@/utils/i18n";

import Warn from "./RealNameWarn";

import Header from "@/layouts/Header";
import useAuthStore from "@/pages/auth/store";
import useGlobalStore from "@/pages/globalStore";
import useSiteSettingStore from "@/pages/siteSetting";

const TOAST_KEY = "sealafLastToastTime";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function BasicLayout() {
  const { init, loading, userInfo } = useGlobalStore((state) => state);
  const { siteSettings } = useSiteSettingStore((state) => state);
  const { showInfo } = useGlobalStore(({ showInfo }) => ({ showInfo }));
  const { phoneProvider } = useAuthStore((state) => ({
    phoneProvider: state.phoneProvider,
  }));

  useEffect(() => {
    init();
  }, [init]);

  const showNotification = useCallback(() => {
    const lastToastTime = localStorage.getItem(TOAST_KEY);
    const now = new Date().getTime();

    if (!lastToastTime || now - parseInt(lastToastTime) > ONE_DAY_IN_MS) {
      const message =
        i18n.language === "zh"
          ? siteSettings?.sealaf_notification?.metadata?.message?.zh
          : siteSettings?.sealaf_notification?.metadata?.message?.en;

      showInfo(
        <a
          href={siteSettings?.sealaf_notification?.metadata?.gotoSite}
          className="font-bold underline transition ease-in-out"
        >
          {message}
        </a>,
        9000,
        true,
      );
      localStorage.setItem(TOAST_KEY, now.toString());
    }
  }, [showInfo, siteSettings]);

  useEffect(() => {
    if (!loading && siteSettings?.sealaf_notification?.value === "on") {
      showNotification();
    }
  }, [loading, siteSettings, showNotification]);

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
