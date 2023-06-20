import { useTranslation } from "react-i18next";
import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import SettingModal, { TabKeys } from "@/pages/app/setting";
import PATList from "@/pages/app/setting/PATList";
import Usage from "@/pages/app/setting/Usage";
import UserInfo from "@/pages/app/setting/UserInfo";
export default function UserSetting(props: { name: string; avatar?: string; width: string }) {
  const { t } = useTranslation();
  return (
    <Menu>
      <MenuButton>
        <Avatar
          size="sm"
          name={props.name}
          src={props.avatar}
          bgColor="primary.500"
          color="white"
          boxShadow="base"
          boxSize={props.width}
        />
      </MenuButton>
      <MenuList minW={"150px"}>
        <SettingModal
          tabMatch={[
            {
              key: TabKeys.UserInfo,
              name: String(t("SettingPanel.UserInfo")),
              component: <UserInfo />,
            },
            {
              key: TabKeys.Usage,
              name: String(t("SettingPanel.Usage")),
              component: <Usage />,
            },
            {
              key: TabKeys.PAT,
              name: t("Personal Access Token"),
              component: <PATList />,
            },
          ]}
          headerTitle={t("SettingPanel.UserSetting")}
          currentTab={TabKeys.UserInfo}
        >
          <MenuItem minH="40px">{t("SettingPanel.UserSetting")}</MenuItem>
        </SettingModal>

        <SettingModal
          tabMatch={[
            {
              key: TabKeys.UserInfo,
              name: String(t("SettingPanel.UserInfo")),
              component: <UserInfo />,
            },
            {
              key: TabKeys.Usage,
              name: String(t("SettingPanel.Usage")),
              component: <Usage />,
            },
            {
              key: TabKeys.PAT,
              name: t("Personal Access Token"),
              component: <PATList />,
            },
          ]}
          headerTitle={t("SettingPanel.UserSetting")}
          currentTab={TabKeys.Usage}
        >
          <MenuItem minH="40px">{t("SettingPanel.Usage")}</MenuItem>
        </SettingModal>

        <MenuItem
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          {t("Logout")}
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
