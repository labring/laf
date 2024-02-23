import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Divider,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import {
  ContactIcon,
  DiscordIcon,
  ExitIcon,
  GroupIcon,
  UserIcon,
  WalletIcon,
  WechatIcon,
} from "@/components/CommonIcon";

import useTabMatch from "./useTabMatch";

import UserBalance from "@/layouts/Header/UserBalance";
import SettingModal, { TabKeys } from "@/pages/app/setting";
import useSiteSettingStore from "@/pages/siteSetting";

export default function UserSetting(props: { name: string; avatar?: string; width: string }) {
  const darkMode = useColorMode().colorMode === "dark";
  const { siteSettings } = useSiteSettingStore();

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="none" p={0} minW={0} h={0} w={5}>
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
        </Button>
      </PopoverTrigger>
      <PopoverContent
        w={300}
        borderRadius={12}
        mr={6}
        boxShadow={"0px 10px 18px 0px rgba(187, 196, 206, 0.25)"}
      >
        <PopoverBody className="cursor-auto">
          <div
            className={clsx(
              "flex w-full justify-end pb-3 pr-4 pt-2 text-lg",
              darkMode ? "text-white" : "text-grayModern-600",
            )}
          >
            <span
              className="flex cursor-pointer items-center font-medium hover:text-error-500"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              <ExitIcon boxSize={5} className="mr-2" />
              {t("Logout")}
            </span>
          </div>
          <VStack className="mx-4">
            <Avatar
              boxSize="80px"
              name={props.name}
              src={props.avatar}
              bgColor="primary.500"
              color="white"
              boxShadow="base"
            />
            <span
              className={clsx(
                "flex w-full justify-center text-2xl font-semibold",
                darkMode ? "text-white" : "text-grayModern-900",
              )}
            >
              {props.name}
            </span>
            <UserBalance />
          </VStack>
          <VStack className={clsx("mx-4 pb-1")} pt="5" spacing="0">
            <div className="w-full">
              <SettingModal
                tabMatch={useTabMatch("user")}
                headerTitle={t("SettingPanel.UserCenter")}
                currentTab={TabKeys.UserInfo}
              >
                <div
                  className={clsx(
                    "flex h-[42px] cursor-pointer items-center justify-between rounded px-[9px] text-lg",
                    darkMode
                      ? "!text-white hover:bg-grayModern-600"
                      : "!text-grayModern-600 hover:bg-[#F4F6F8]",
                  )}
                >
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
                tabMatch={useTabMatch("usage")}
                headerTitle={t("SettingPanel.Usage")}
                currentTab={TabKeys.CostOverview}
              >
                <div
                  className={clsx(
                    "flex h-[42px] cursor-pointer items-center justify-between rounded px-[9px] text-lg",
                    darkMode
                      ? "!text-white hover:bg-grayModern-600"
                      : "!text-grayModern-600 hover:bg-[#F4F6F8]",
                  )}
                >
                  <span className="flex items-center space-x-3">
                    <WalletIcon color={darkMode ? "white" : "#5A646E"} />
                    <p>{t("SettingPanel.Usage")}</p>
                  </span>
                  <ChevronRightIcon />
                </div>
              </SettingModal>
            </div>
            <Divider />
            {siteSettings.laf_business_url?.value && (
              <div
                className={clsx(
                  "flex h-[42px] w-full cursor-pointer items-center justify-between rounded px-[9px] text-lg",
                  darkMode
                    ? "!text-white hover:bg-grayModern-600"
                    : "!text-grayModern-600 hover:bg-[#F4F6F8]",
                )}
                onClick={() => {
                  window.open(siteSettings.laf_business_url?.value, "_blank");
                }}
              >
                <span className="flex items-center">
                  <ContactIcon fontSize={20} mr={3} />
                  {t("HomePage.NavBar.contact")}
                </span>
                <ChevronRightIcon />
              </div>
            )}
            {(siteSettings.laf_wechat_url?.value || siteSettings.laf_discord_url?.value) && (
              <div className="flex h-[42px] w-full items-center justify-between px-[9px] text-lg">
                <span
                  className={clsx(
                    "flex items-center",
                    darkMode ? "!text-white" : "!text-grayModern-600",
                  )}
                >
                  <GroupIcon fontSize={20} mr={3} />
                  {t("HomePage.NavBar.community")}
                </span>
                <span>
                  {siteSettings.laf_wechat_url?.value && (
                    <a
                      href={siteSettings.laf_wechat_url?.value}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-2.5"
                    >
                      <WechatIcon className="cursor-pointer !text-grayModern-400" fontSize={20} />
                    </a>
                  )}
                  {siteSettings.laf_discord_url?.value && (
                    <a href={siteSettings.laf_discord_url?.value} target="_blank" rel="noreferrer">
                      <DiscordIcon className="cursor-pointer !text-grayModern-400" fontSize={20} />
                    </a>
                  )}
                </span>
              </div>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
