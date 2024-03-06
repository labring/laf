import { useEffect, useState } from "react";
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

import "./index.css";

import { TApplicationDetail } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

export type TTabItem = {
  key: string;
  name: string;
  component: React.ReactElement;
  icon: React.ReactElement;
  status?: string | null;
};

export type TTabMatch = {
  title: string;
  items: TTabItem[];
}[];

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
  children?: React.ReactElement;
  setApp?: TApplicationDetail;
  tabMatch?: TTabMatch;
  currentTab: string;
  openModal?: boolean;
  setOpenModal?: (open: boolean) => void;
}) => {
  const { headerTitle, children, setApp, tabMatch = [], openModal, setOpenModal } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const allItems = tabMatch.reduce((prev: any, curr) => [...prev, ...curr.items], []);
  const currentIndex = allItems
    .map((tab: any) => tab)
    .findIndex((tab: TTabItem) => tab.key === props.currentTab);
  const [item, setItem] = useState<TTabItem>(allItems[currentIndex]);
  const { setCurrentApp } = useGlobalStore((state) => state);
  const borderColor = useColorModeValue("lafWhite.600", "lafDark.600");
  const darkMode = useColorMode().colorMode === "dark";

  useEffect(() => {
    if (!children && openModal && setOpenModal) {
      onOpen();
      setOpenModal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            if (setApp) {
              setCurrentApp(setApp);
            }
            onOpen();
          },
        })}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW={"80%"} width={"auto"} minW={1060}>
          <ModalCloseButton />
          <ModalBody py={2} minH={550} className="relative">
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
                      <div key={tab.title}>
                        {tab.title !== "" && (
                          <div className="mt-4 font-medium text-grayModern-500">{tab.title}</div>
                        )}
                        {tab.items.map((tab) => {
                          return (
                            <SectionList.Item
                              className={clsx(
                                "mt-2 !h-[42px] w-[180px] rounded-md font-medium text-grayModern-500",
                              )}
                              isActive={item?.key === tab.key}
                              key={tab.key}
                              onClick={() => {
                                setItem(tab);
                              }}
                            >
                              <span className="flex">
                                <span className="flex items-center pr-2">{tab.icon}</span>
                                <div className="w-[85%] truncate whitespace-nowrap">{tab.name}</div>
                                {tab?.status && (
                                  <span className="scale-75 whitespace-nowrap rounded-full border border-red-300 px-1 text-red-300">
                                    {tab.status}
                                  </span>
                                )}
                              </span>
                            </SectionList.Item>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </SectionList>
              <div className="ml-[236px] h-full w-full p-2">
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
