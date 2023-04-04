import { useState } from "react";
import React from "react";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
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
};

export const TabKeys = {
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

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{headerTitle || t("SettingPanel.Setting")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody px={6} py={2} h="60vh" maxH="70vh" flex="none">
            <Box className="flex h-full" borderColor={borderColor}>
              <SectionList className="mr-4 w-[250px] border-r-2 pr-4">
                {tabMatch.map((tab) => {
                  return (
                    <SectionList.Item
                      className="mt-2 rounded-md"
                      isActive={item?.key === tab.key}
                      key={tab.key}
                      onClick={() => {
                        setItem(tab);
                      }}
                    >
                      {tab.name}
                    </SectionList.Item>
                  );
                })}
              </SectionList>
              <div className="w-full">
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
