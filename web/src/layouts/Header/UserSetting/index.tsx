import { useTranslation } from "react-i18next";
import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import {
  BillingIcon,
  CardIcon,
  ChargeIcon,
  CostIcon,
  InviteIcon,
  PATIcon,
  StandardIcon,
  UserIcon,
} from "@/components/CommonIcon";

import SettingModal, { TabKeys } from "@/pages/app/setting";
import BillingDetails from "@/pages/app/setting/BillingDetails";
import CardRedemption from "@/pages/app/setting/CardRedemption";
import PATList from "@/pages/app/setting/PATList";
import PricingStandards from "@/pages/app/setting/PricingStandards";
import Usage from "@/pages/app/setting/Usage";
import UserInfo from "@/pages/app/setting/UserInfo";
import UserInvite from "@/pages/app/setting/UserInvite";

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
              icon: <UserIcon boxSize={4} />,
            },
            {
              key: TabKeys.UserInvite,
              name: String(t("SettingPanel.UserInvite")),
              component: <UserInvite />,
              icon: <InviteIcon boxSize={4} />,
            },
            {
              key: TabKeys.PAT,
              name: t("Personal Access Token"),
              component: <PATList />,
              icon: <PATIcon boxSize={4} />,
            },
          ]}
          headerTitle={t("SettingPanel.UserCenter")}
          currentTab={TabKeys.UserInfo}
        >
          <MenuItem minH="40px">{t("SettingPanel.UserCenter")}</MenuItem>
        </SettingModal>

        <SettingModal
          tabMatch={[
            {
              key: TabKeys.CostOverview,
              name: String(t("SettingPanel.CostOverview")),
              component: <Usage />,
              icon: <CostIcon boxSize={4} />,
            },
            {
              key: TabKeys.CardRedemption,
              name: String(t("SettingPanel.CardRedemption")),
              component: <CardRedemption />,
              icon: <CardIcon boxSize={4} />,
            },
            {
              key: TabKeys.BillingDetails,
              name: String(t("SettingPanel.BillingDetails")),
              component: <BillingDetails />,
              icon: <BillingIcon boxSize={4} />,
            },
            {
              key: TabKeys.RechargeHistory,
              name: String(t("SettingPanel.RechargeHistory")),
              component: <></>,
              icon: <ChargeIcon boxSize={4} />,
            },
            {
              key: TabKeys.PricingStandards,
              name: String(t("SettingPanel.PricingStandards")),
              component: <PricingStandards />,
              icon: <StandardIcon boxSize={4} />,
            },
          ]}
          headerTitle={t("SettingPanel.Usage")}
          currentTab={TabKeys.CostOverview}
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
