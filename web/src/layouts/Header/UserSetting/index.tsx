import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar, Menu, MenuButton, MenuItem, MenuList, useColorMode } from "@chakra-ui/react";

import i18n from "@/utils/i18n";

import SettingModal, { TabKeys } from "@/pages/app/setting";
import PATList from "@/pages/app/setting/PATList";
import Usage from "@/pages/app/setting/Usage";
import UserInfo from "@/pages/app/setting/UserInfo";
export default function UserSetting(props: { name: string; avatar?: string; width: string }) {
  const { t } = useTranslation();
  const { toggleColorMode } = useColorMode();
  const navigate = useNavigate();
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
          minH="40px"
          onClick={() => {
            navigate("/my");
          }}
        >
          {t("MyTemplate")}
        </MenuItem>

        <MenuItem
          minH="40px"
          onClick={() => {
            i18n.changeLanguage(i18n.language === "en" ? "zh" : "en");
          }}
        >
          {t("SwitchLanguage")}
        </MenuItem>

        <MenuItem
          minH="40px"
          onClick={() => {
            toggleColorMode();
            window.dispatchEvent(new Event("ColorModeChange"));
          }}
        >
          {t("SwitchColorMode")}
        </MenuItem>

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
