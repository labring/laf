import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { t } from "i18next";

import SettingModal from "@/pages/app/setting";
import PATList from "@/pages/app/setting/PATList";
export default function UserSetting(props: { name: string; avatar?: string; width: string }) {
  return (
    <Menu>
      <MenuButton>
        <Avatar
          size="sm"
          name={props.name}
          bgColor="primary.500"
          color="white"
          boxShadow="base"
          boxSize={props.width}
        />
      </MenuButton>
      <MenuList minW={"150px"}>
        <SettingModal
          headerTitle={t("SettingPanel.UserSetting")}
          tabMatch={[
            {
              key: "pat",
              name: "Personal Access Token",
              component: <PATList />,
            },
          ]}
        >
          <MenuItem>{t("SettingPanel.UserSetting")}</MenuItem>
        </SettingModal>
        <MenuItem
          onClick={() => {
            localStorage.clear();
            (window as any).location.href = (import.meta.env.VITE_SERVER_URL +
              "/v1/login") as string;
          }}
        >
          {t("Logout")}
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
