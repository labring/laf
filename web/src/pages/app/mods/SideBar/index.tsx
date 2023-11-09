/****************************
 * cloud functions SideBar menu
 ***************************/

import { NavLink, useParams } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { Pages, Routes, SideBarWidth } from "@/constants/index";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import SysSetting from "../../setting/SysSetting";

import Icons from "./Icons";

import styles from "./index.module.scss";

import UserSetting from "@/pages/app/setting/UserSetting";
import useGlobalStore from "@/pages/globalStore";
type TIcon = {
  pageId: string;
  component?: React.ReactNode;
  icon?: React.ReactNode;
  name?: string;
};
export default function SideBar() {
  const { pageId } = useParams();
  const { currentApp, setCurrentPage, userInfo, avatarUpdatedAt, regions = [] } = useGlobalStore();
  const currentRegion =
    regions.find((item: any) => item._id === currentApp?.regionId) || regions[0];

  const ICONS: TIcon[] = [
    {
      pageId: "nav",
      icon: (
        <div className="relative flex flex-col items-center">
          <img className="mt-2" src="/logo.png" alt="logo" width={34} />
          <span className="scale-[.65] text-second">{currentRegion.displayName}</span>
        </div>
      ),
    },
    {
      pageId: Pages.function,
      name: String(t("FunctionPanel.Function")),
      icon: <Icons type="function" />,
    },
    {
      pageId: Pages.database,
      name: String(t("CollectionPanel.Collection")),
      icon: <Icons type="database" />,
    },
    {
      pageId: Pages.storage,
      name: String(t("StoragePanel.Storage")),
      icon: <Icons type="storage" />,
    },
  ];

  const BOTTOM_ICONS: TIcon[] = [
    {
      pageId: Pages.userSetting,
      component: (
        <UserSetting
          name={userInfo?.username || ""}
          avatar={getAvatarUrl(userInfo?._id, avatarUpdatedAt)}
          width={"28px"}
        />
      ),
    },
    {
      pageId: Pages.setting,
      component: (
        <SysSetting>
          <div>
            <Icons type="setting" />
          </div>
        </SysSetting>
      ),
    },
  ];
  return (
    <div
      style={{ width: SideBarWidth }}
      className="absolute bottom-0 top-0 flex flex-col justify-between"
    >
      {[ICONS, BOTTOM_ICONS].map((icons, index) => {
        return (
          <div key={index}>
            {icons.map((item) => {
              if (item.pageId === "nav") {
                return (
                  <a key={item.pageId} href={Routes.dashboard}>
                    {item.icon}
                  </a>
                );
              }
              if (item.icon) {
                return (
                  <NavLink
                    to={`/app/${currentApp?.appid}/${item.pageId}`}
                    key={item.pageId}
                    className={clsx(styles.icon, " mx-1 items-center ", {
                      [styles.current]: pageId === item.pageId,
                      "my-4": item.name !== undefined,
                    })}
                    onClick={() => {
                      if (item.name !== undefined) {
                        setCurrentPage(item.pageId);
                      }
                    }}
                  >
                    {item.icon}
                    <p className="scale-[.75]">{item.name ? item.name : null}</p>
                  </NavLink>
                );
              }
              return (
                <Center
                  key={item.pageId}
                  className={clsx(styles.icon, " mx-1 items-center ", {
                    [styles.current]: pageId === item.pageId,
                    "my-4": item.name !== undefined,
                  })}
                >
                  {item.component}
                  <p className="scale-[.75]">{item.name ? item.name : null}</p>
                </Center>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
