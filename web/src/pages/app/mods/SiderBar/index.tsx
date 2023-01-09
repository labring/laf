/****************************
 * cloud functions siderbar menu
 ***************************/

import { AiFillDatabase, AiOutlineFunction } from "react-icons/ai";
import { GrCatalogOption, GrSettingsOption, GrStorage } from "react-icons/gr";
import { useNavigate, useParams } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import clsx from "clsx";

import IconWrap from "@/components/IconWrap";
import { Pages, SiderBarWidth } from "@/constants/index";

import styles from "./index.module.scss";

import AppEnvList from "@/pages/app/setting/AppEnvList/index";
import SettingModal from "@/pages/app/setting/index";
import useGlobalStore from "@/pages/globalStore";

export default function SiderBar() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { currentApp, setCurrentPage } = useGlobalStore();

  const ICONS = [
    {
      pageId: Pages.function,
      component: (
        <IconWrap tooltip="函数" placement="right">
          <AiOutlineFunction size="24" />
        </IconWrap>
      ),
    },
    {
      pageId: Pages.database,
      component: (
        <IconWrap tooltip="数据库" placement="right">
          <AiFillDatabase size="22" />
        </IconWrap>
      ),
    },
    {
      pageId: Pages.storage,
      component: (
        <IconWrap tooltip="云存储" placement="right">
          <GrStorage size="20" />
        </IconWrap>
      ),
    },
    {
      pageId: Pages.logs,
      component: (
        <IconWrap tooltip="日志" placement="right">
          <GrCatalogOption size="18" />
        </IconWrap>
      ),
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
          <IconWrap tooltip="设置" placement="right" onClick={() => {}}>
            <GrSettingsOption size="18" />
          </IconWrap>
        </SettingModal>
      ),
    },
  ];
  return (
    <div
      style={{ width: SiderBarWidth, background: "#f2f3f9" }}
      className="absolute top-0 bottom-0 "
    >
      {ICONS.map((item, index) => {
        return (
          <Center
            key={index}
            className={clsx(styles.icon, {
              [styles.current]: pageId === item.pageId,
              [styles.bottom]: Pages.setting === item.pageId,
            })}
            style={{
              height: SiderBarWidth,
            }}
            onClick={() => {
              if (item.pageId !== Pages.setting) {
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
}
