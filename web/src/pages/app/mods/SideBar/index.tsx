/****************************
 * cloud functions SideBar menu
 ***************************/

import { AiFillDatabase, AiOutlineFunction } from "react-icons/ai";
import { GrCatalogOption, GrSettingsOption, GrStorage } from "react-icons/gr";
import { RiCodeBoxFill } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import clsx from "clsx";

import { TriggerIcon } from "@/components/CommonIcon";
import IconWrap from "@/components/IconWrap";
import { Pages, SideBarWidth } from "@/constants/index";

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
      component: <RiCodeBoxFill size={32} />,
    },
    {
      pageId: Pages.function,
      component: (
        <IconWrap tooltip="函数" placement="right" size={32}>
          <AiOutlineFunction size="32" />
        </IconWrap>
      ),
    },
    {
      pageId: Pages.trigger,
      component: (
        <IconWrap tooltip="触发器" placement="right" size={32}>
          <TriggerIcon fontSize={32} />
        </IconWrap>
      ),
    },
    {
      pageId: Pages.database,
      component: (
        <IconWrap tooltip="数据库" placement="right" size={32}>
          <AiFillDatabase size="28" />
        </IconWrap>
      ),
    },
    {
      pageId: Pages.storage,
      component: (
        <IconWrap tooltip="云存储" placement="right" size={32}>
          <GrStorage size="26" />
        </IconWrap>
      ),
    },
    {
      pageId: Pages.logs,
      component: (
        <IconWrap tooltip="日志" placement="right" size={32}>
          <GrCatalogOption size="26" />
        </IconWrap>
      ),
    },
  ];

  const BOTTOM_ICONS = [
    {
      pageId: Pages.userSetting,
      component: <UserSetting avatar={userInfo.profile?.avatar} width={28} />,
    },
    {
      pageId: Pages.setting,
      component: (
        <SettingModal
          headerTitle="应用设置"
          tabMatch={[
            {
              key: "env",
              name: "环境变量",
              component: <AppEnvList />,
            },
          ]}
        >
          <IconWrap tooltip="设置" placement="right" size={32}>
            <GrSettingsOption size="26" />
          </IconWrap>
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
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    <RiCodeBoxFill size={32} />
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
                    if (item.pageId !== Pages.setting && item.pageId !== Pages.userSetting) {
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
