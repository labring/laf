import { useTranslation } from "react-i18next";
import { Avatar, Menu, MenuButton, MenuItem, MenuList, useColorMode } from "@chakra-ui/react";

import { CHAKRA_UI_COLOR_MODE_KEY, COLOR_MODE } from "@/constants";
import i18n from "@/utils/i18n";

import SettingModal, { TabKeys } from "@/pages/app/setting";
import PATList from "@/pages/app/setting/PATList";
import UserInfo from "@/pages/app/setting/UserInfo";
export default function UserSetting(props: { name: string; avatar?: string; width: string }) {
  const { t } = useTranslation();
  const { toggleColorMode } = useColorMode();
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
              key: "user-info",
              name: String(t("SettingPanel.UserInfo")),
              component: <UserInfo />,
            },
            {
              key: "pat",
              name: t("Personal Access Token"),
              component: <PATList />,
            },
          ]}
          headerTitle={t("SettingPanel.UserSetting")}
          currentTab={TabKeys.UserInfo}
        >
          <MenuItem minH="40px">{t("SettingPanel.UserSetting")}</MenuItem>
        </SettingModal>

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
            localStorage.setItem(CHAKRA_UI_COLOR_MODE_KEY, COLOR_MODE.light);
            window.location.href = "/login";
          }}
        >
          {t("Logout")}
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
