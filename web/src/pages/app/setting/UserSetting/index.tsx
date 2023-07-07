import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Divider,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  VStack,
} from "@chakra-ui/react";

import {
  BillingIcon,
  CardIcon,
  ChargeIcon,
  ContactIcon,
  CostIcon,
  ExitIcon,
  InviteIcon,
  PATIcon,
  StandardIcon,
  UserIcon,
} from "@/components/CommonIcon";

import UserBalance from "@/layouts/Header/UserBalance";
import SettingModal, { TabKeys } from "@/pages/app/setting";
import BillingDetails from "@/pages/app/setting/BillingDetails";
import CardRedemption from "@/pages/app/setting/CardRedemption";
import PATList from "@/pages/app/setting/PATList";
import PricingStandards from "@/pages/app/setting/PricingStandards";
import RechargeHistory from "@/pages/app/setting/RechargeHistory";
import Usage from "@/pages/app/setting/Usage";
import UserInfo from "@/pages/app/setting/UserInfo";
import UserInvite from "@/pages/app/setting/UserInvite";

export default function UserSetting(props: { name: string; avatar?: string; width: string }) {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger>
        <Avatar
          size="sm"
          name={props.name}
          src={props.avatar}
          bgColor="primary.500"
          color="white"
          boxShadow="base"
          boxSize={props.width}
          className="cursor-pointer"
        />
      </PopoverTrigger>
      <PopoverContent w={300} borderRadius={12} mr={6}>
        <PopoverBody>
          <div className="flex w-full justify-end pb-3 pr-7 pt-2 text-lg">
            <span
              className="flex cursor-pointer items-center hover:text-error-500"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              <ExitIcon boxSize={4} className="mr-1" />
              {t("Logout")}
            </span>
          </div>
          <VStack className="mx-6">
            <Avatar
              size="xl"
              name={props.name}
              src={props.avatar}
              bgColor="primary.500"
              color="white"
              boxShadow="base"
            />
            <span className="text-2xl">{props.name}</span>
            <UserBalance />
          </VStack>
          <VStack className="mx-6" pt={5} spacing={0}>
            <div className="w-full">
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
                <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-3 text-lg hover:bg-[#F4F6F8]">
                  <span className="flex items-center">
                    <UserIcon boxSize={4} mr={3} />
                    {t("SettingPanel.UserCenter")}
                  </span>
                  <ChevronRightIcon />
                </div>
              </SettingModal>
            </div>
            <div className="w-full">
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
                    component: <RechargeHistory />,
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
                <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-3 text-lg hover:bg-[#F4F6F8] ">
                  <span className="flex items-center">
                    <BillingIcon boxSize={4} mr={3} />
                    {t("SettingPanel.Usage")}
                  </span>
                  <ChevronRightIcon />
                </div>
              </SettingModal>
            </div>
            <Divider className="mx-6" />
            <div
              className="flex w-full cursor-pointer items-center justify-between rounded-sm px-1 py-3 text-lg hover:bg-[#F4F6F8]"
              onClick={() => {
                window.open("https://www.wenjuan.com/s/I36ZNbl/", "_blank");
              }}
            >
              <span className="flex items-center">
                <ContactIcon boxSize={4} mr={3} />
                {t("HomePage.NavBar.contact")}
              </span>
              <ChevronRightIcon />
            </div>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
