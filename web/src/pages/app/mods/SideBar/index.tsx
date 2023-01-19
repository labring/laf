/****************************
 * cloud functions SideBar menu
 ***************************/

import { useNavigate, useParams } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { Pages, SideBarWidth } from "@/constants/index";

import Icons from "./Icons";

import styles from "./index.module.scss";

import UserSetting from "@/layouts/Header/UserSetting";
import AppEnvList from "@/pages/app/setting/AppEnvList/index";
import SettingModal from "@/pages/app/setting/index";
import useGlobalStore from "@/pages/globalStore";

export default function SideBar() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { currentApp, setCurrentPage, userInfo } = useGlobalStore();

  const ICONS = [
    {
      pageId: "nav",
      component: <img src="/logo.png" alt="logo" width={24} />,
    },
    {
      pageId: Pages.function,
      component: <Icons type="function" />,
    },
    {
      pageId: Pages.database,
      component: <Icons type="database" />,
    },
    {
      pageId: Pages.storage,
      component: <Icons type="storage" />,
    },
    {
      pageId: Pages.logs,
      component: <Icons type="logs" />,
    },
  ];

  const BOTTOM_ICONS = [
    // {
    //   pageId: "lan",
    //   component: (
    //     <Button
    //       onClick={() => {
    //         i18next.changeLanguage("en", (err, t) => {
    //           if (err) return console.log("something went wrong loading", err);
    //           t("key"); // -> same as i18next.t
    //         });
    //       }}
    //     ></Button>
    //   ),
    // },
    {
      pageId: Pages.userSetting,
      component: (
        <UserSetting
          name={userInfo?.profile.name || ""}
          avatar={userInfo?.profile?.avatar}
          width={"28px"}
        />
      ),
    },
    {
      pageId: Pages.setting,
      component: (
        <SettingModal
          headerTitle={t("SettingPanel.SystemSetting")}
          tabMatch={[
            {
              key: "env",
              name: t("SettingPanel.AppEnv"),
              component: <AppEnvList />,
            },
          ]}
        >
          <div>
            <Icons type="setting" />
          </div>
        </SettingModal>
      ),
    },
  ];
  return (
    <div
      style={{ width: SideBarWidth }}
      className="absolute top-0 bottom-0 flex flex-col justify-between"
    >
      {[ICONS, BOTTOM_ICONS].map((icons, index) => {
        return (
          <div key={index}>
            {icons.map((item) => {
              if (item.pageId === "nav") {
                return (
                  <Center
                    key={item.pageId}
                    style={{
                      height: 48,
                    }}
                    className="cursor-pointer"
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    {item.component}
                  </Center>
                );
              }
              return (
                <Center
                  key={item.pageId}
                  className={clsx(styles.icon, "m-2", {
                    [styles.current]: pageId === item.pageId,
                  })}
                  onClick={() => {
                    if (
                      item.pageId !== Pages.setting &&
                      item.pageId !== Pages.userSetting &&
                      item.pageId !== "lan"
                    ) {
                      setCurrentPage(item.pageId);
                      navigate(`/app/${currentApp?.appid}/${item.pageId}`);
                    }
                  }}
                >
                  {item.component}
                </Center>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
