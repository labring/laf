import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Divider,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import clsx from "clsx";

import {
  BillingIcon,
  CardIcon,
  ChargeIcon,
  ContactIcon,
  CostIcon,
  DiscordIcon,
  ExitIcon,
  GroupIcon,
  InviteIcon,
  PATIcon,
  StandardIcon,
  UserIcon,
  WechatIcon,
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
  const darkMode = useColorMode().colorMode === "dark";

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
        <PopoverBody className="cursor-auto">
          <div
            className={clsx(
              "flex w-full justify-end pb-3 pr-7 pt-2 text-lg",
              darkMode ? "text-white" : "text-grayModern-600",
            )}
          >
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
            <span className={clsx("text-2xl", darkMode ? "text-white" : "text-grayModern-900")}>
              {props.name}
            </span>
            <UserBalance />
          </VStack>
          <VStack
            className={clsx("mx-6", darkMode ? "text-white" : "text-grayModern-600")}
            pt={5}
            spacing={0}
          >
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
                    <UserIcon fontSize={20} mr={3} />
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
                    <BillingIcon fontSize={20} mr={3} />
                    {t("SettingPanel.Usage")}
                  </span>
                  <ChevronRightIcon />
                </div>
              </SettingModal>
            </div>
            <Divider />
            <div
              className="flex w-full cursor-pointer items-center justify-between rounded-sm px-1 py-3 text-lg hover:bg-[#F4F6F8]"
              onClick={() => {
                window.open("https://www.wenjuan.com/s/I36ZNbl/", "_blank");
              }}
            >
              <span className="flex items-center">
                <ContactIcon fontSize={20} mr={3} />
                {t("HomePage.NavBar.contact")}
              </span>
              <ChevronRightIcon />
            </div>
            <div className="flex w-full items-center justify-between px-1 py-3 text-lg">
              <span className="flex items-center">
                <GroupIcon fontSize={20} mr={3} />
                {t("HomePage.NavBar.community")}
              </span>
              <span>
                <a
                  href="https://w4mci7-images.oss.laf.run/wechat.png"
                  target="_blank"
                  rel="noreferrer"
                  className="mr-1"
                >
                  <WechatIcon className="cursor-pointer !text-grayModern-400" fontSize={20} />
                </a>
                <a
                  href="https://discord.com/channels/1061659231599738901/1098516786170839050"
                  target="_blank"
                  rel="noreferrer"
                  className="mr-1"
                >
                  <DiscordIcon className="cursor-pointer !text-grayModern-400" fontSize={20} />
                </a>
              </span>
            </div>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
