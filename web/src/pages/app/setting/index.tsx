import { useState } from "react";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import SectionList from "@/components/SectionList";

import { TApplication } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";
export type TTabItem = {
  key: string;
  name: string;
  component: React.ReactElement;
};
const SettingModal = (props: {
  headerTitle: string;
  children: React.ReactElement;
  tabMatch: TTabItem[];
  setApp?: TApplication;
}) => {
  const { headerTitle, tabMatch, children, setApp } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [item, setItem] = useState<TTabItem>();
  const { setCurrentApp } = useGlobalStore((state) => state);
  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          if (setApp) {
            setCurrentApp(setApp);
          }
          setItem(tabMatch[0]);
          onOpen();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{headerTitle || t("SettingPanel.Setting")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody px={6} py={2} h="60vh" maxH="70vh" flex="none">
            <div className="flex h-full">
              <SectionList className="w-[250px] mr-4 border-r-2 border-lafWhite-600 pr-4">
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
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SettingModal;
