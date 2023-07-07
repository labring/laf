import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Avatar,
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
  CostIcon,
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
      <PopoverContent>
        <PopoverBody>
          <div
            className="flex w-full cursor-pointer justify-end pb-3 pr-7 text-lg"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            {t("Logout")}
          </div>
          <VStack>
            <Avatar
              size="lg"
              name={props.name}
              src={props.avatar}
              bgColor="primary.500"
              color="white"
              boxShadow="base"
              className="cursor-pointer"
            />
            <span className="text-2xl">{props.name}</span>
            <UserBalance />
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
                <div className="mt-5 flex cursor-pointer justify-between px-12 text-xl">
                  <span>{t("SettingPanel.UserCenter")}</span>
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
                <div className="mb-5 flex cursor-pointer justify-between px-12 text-xl">
                  <span>{t("SettingPanel.Usage")}</span>
                  <ChevronRightIcon />
                </div>
              </SettingModal>
            </div>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
