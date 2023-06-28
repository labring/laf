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
        <ModalContent maxW={"80%"} width={"auto"} minW={"1000px"}>
          <ModalHeader>{headerTitle || t("SettingPanel.Setting")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={2} flex="none" minH="60vh" className="relative">
            <Box className="flex h-full" borderColor={borderColor}>
              <SectionList className="absolute bottom-0 top-0 mr-4 min-w-[200px] border-r pr-4">
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
              <div className="ml-[210px] w-full overflow-hidden p-2">
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
