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

import SectionList from "@/components/SectionList";
export type TtabItem = {
  key: string;
  name: string;
  component: React.ReactElement;
};
const SettingModal = (props: {
  headerTitle: string;
  children: React.ReactElement;
  tabMatch: TtabItem[];
}) => {
  const { headerTitle, tabMatch, children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [item, setItem] = useState<TtabItem>();

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          setItem(tabMatch[0]);
          onOpen();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{headerTitle || "设置"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <div className="flex">
              <SectionList style={{ width: "200px", marginRight: "15px" }}>
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
                <h3 className="ml-2 pb-2 mb-4 font-bold border-gray-200 border-b border-solid">
                  {item?.name}
                </h3>
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
