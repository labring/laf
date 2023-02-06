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
type TIcon = {
  pageId: string;
  component: any;
  name?: string;
};
export default function SideBar() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { currentApp, setCurrentPage, userInfo } = useGlobalStore();

  const ICONS: TIcon[] = [
    {
      pageId: "nav",
      component: <img src="/logo.png" alt="logo" width={34} />,
    },
    {
      pageId: Pages.function,
      name: String(t("FunctionPanel.Function")),
      component: <Icons type="function" />,
    },
    {
      pageId: Pages.database,
      name: String(t("CollectionPanel.Collection")),
      component: <Icons type="database" />,
    },
    {
      pageId: Pages.storage,
      name: String(t("StoragePanel.Storage")),
      component: <Icons type="storage" />,
    },
    {
      pageId: Pages.logs,
      name: String(t("LogPanel.Log")),
      component: <Icons type="logs" />,
    },
  ];

  const BOTTOM_ICONS: TIcon[] = [
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
                  className={clsx(styles.icon, " mx-2 ", {
                    [styles.current]: pageId === item.pageId,
                    "my-4": item.name !== undefined,
                  })}
                  onClick={() => {
                    if (item.name !== undefined) {
                      setCurrentPage(item.pageId);
                      navigate(`/app/${currentApp?.appid}/${item.pageId}`);
                    }
                  }}
                >
                  {item.component}
                  <p className="scale-90">{item.name ? item.name : null}</p>
                </Center>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
