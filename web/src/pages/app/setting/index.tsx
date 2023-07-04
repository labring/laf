import { useState } from "react";
import React from "react";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
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
  Usage: "usage",
  UserInfo: "user-info",
  PAT: "pat",
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

      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxW={"80%"} width={"auto"} minW={960} height={481}>
          <ModalBody py={2} flex="none" height={"full"} className="relative">
            <ModalCloseButton />
            <Box className="flex h-full" borderColor={borderColor}>
              <SectionList className="absolute bottom-0 left-0 top-0 min-w-[268px] rounded-l-lg bg-[#E4E9EE]">
                <span className="relative left-6 top-5 text-2xl font-semibold">
                  {headerTitle || t("SettingPanel.Setting")}
                </span>
                <div className="relative left-6 top-6">
                  {tabMatch.map((tab) => {
                    return (
                      <SectionList.Item
                        className="mt-2 w-[220px] rounded-md"
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
              <div className="ml-[268px] w-full overflow-hidden p-2 pt-10">
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
