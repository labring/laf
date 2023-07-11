import { useState } from "react";
import React from "react";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import SectionList from "@/components/SectionList";

import { TApplicationDetail } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";
export type TTabItem = {
  key: string;
  name: string;
  component: React.ReactElement;
  icon: React.ReactElement;
};

export const TabKeys = {
  CostOverview: "cost-overview",
  CardRedemption: "card-redemption",
  BillingDetails: "billing-details",
  RechargeHistory: "recharge-history",
  PricingStandards: "pricing-standards",
  UserInfo: "user-info",
  PAT: "pat",
  UserInvite: "user-invite",
};

const SettingModal = (props: {
  headerTitle: string;
  children: React.ReactElement;
  setApp?: TApplicationDetail;
  tabMatch?: TTabItem[];
  currentTab: string;
}) => {
  const { headerTitle, children, setApp, tabMatch = [] } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentIndex = tabMatch.findIndex((tab) => tab.key === props.currentTab);
  const [item, setItem] = useState<TTabItem>(tabMatch[currentIndex]);
  const { setCurrentApp } = useGlobalStore((state) => state);
  const borderColor = useColorModeValue("lafWhite.600", "lafDark.600");
  const darkMode = useColorMode().colorMode === "dark";
  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          if (setApp) {
            setCurrentApp(setApp);
          }
          onOpen();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW={"80%"} width={"auto"} minW={1024}>
          <ModalBody py={2} flex="none" minH={500} className="relative">
            <ModalCloseButton />
            <Box className="flex h-full" borderColor={borderColor}>
              <SectionList
                className={clsx(
                  "absolute bottom-0 left-0 top-0 min-w-[228px] rounded-l-lg",
                  !darkMode && "border border-r-[#E4E9EE] bg-[#F4F6F8]",
                )}
              >
                <span className="relative left-6 top-5 text-2xl font-semibold">
                  {headerTitle || t("SettingPanel.Setting")}
                </span>
                <div className="relative left-6 top-6">
                  {tabMatch.map((tab) => {
                    return (
                      <SectionList.Item
                        className="mt-2 !h-[42px] w-[180px] rounded-md"
                        isActive={item?.key === tab.key}
                        key={tab.key}
                        onClick={() => {
                          setItem(tab);
                        }}
                      >
                        <span className="flex">
                          <span className="flex items-center pr-2">{tab.icon}</span>
                          {tab.name}
                        </span>
                      </SectionList.Item>
                    );
                  })}
                </div>
              </SectionList>
              <div className="ml-[236px] w-full overflow-hidden p-2">
                {React.cloneElement(item?.component || <></>, {
                  onClose,
                })}
              </div>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SettingModal;
