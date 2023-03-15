import { useTranslation } from "react-i18next";
import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import { VITE_SERVER_BASE_URL } from "@/constants";
import i18n from "@/utils/i18n";

import SettingModal, { TabKeys } from "@/pages/app/setting";
import PATList from "@/pages/app/setting/PATList";
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
          onClick={() => {
            localStorage.clear();
            (window as any).location.href = (VITE_SERVER_BASE_URL + "/login") as string;
          }}
        >
          {t("Logout")}
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
