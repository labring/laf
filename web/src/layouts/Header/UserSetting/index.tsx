import { AiOutlineTransaction } from "react-icons/ai";
import { HiOutlineUser } from "react-icons/hi";
import { MdOutlineGeneratingTokens } from "react-icons/md";
import { RiTranslate } from "react-icons/ri";
import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { t } from "i18next";

import { VITE_SERVER_BASE_URL } from "@/constants";

import SettingModal from "@/pages/app/setting";
import BillList from "@/pages/app/setting/BillList";
import PATList from "@/pages/app/setting/PATList";
import ProfileSetting from "@/pages/app/setting/Profile";
import UserInfo from "@/pages/app/setting/UserInfo";
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
              key: "user-profile",
              name: "Profile",
              icon: <RiTranslate />,
              component: <ProfileSetting />,
            },
            {
              key: "user-info",
              name: t("SettingPanel.UserInfo"),
              icon: <HiOutlineUser />,
              component: <UserInfo />,
            },
            {
              key: "billing-details",
              name: t("SettingPanel.BillingDetails"),
              icon: <AiOutlineTransaction />,
              component: <BillList />,
            },
            {
              key: "pat",
              name: "Personal Access Token",
              icon: <MdOutlineGeneratingTokens />,
              component: <PATList />,
            },
          ]}
        >
          <MenuItem>{t("SettingPanel.UserSetting")}</MenuItem>
        </SettingModal>
        <MenuItem
          onClick={() => {
            localStorage.clear();
            (window as any).location.href = (VITE_SERVER_BASE_URL + "/v1/login") as string;
          }}
        >
          {t("Logout")}
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
