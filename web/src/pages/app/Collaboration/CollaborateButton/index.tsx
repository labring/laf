import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ChevronDownIcon, CopyIcon, LinkIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import clsx from "clsx";

import { CollaborateIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
import MoreButton from "@/components/MoreButton";
import { COLOR_MODE } from "@/constants";

import useFunctionStore from "../../functions/store";

const data = [
  {
    id: 1,
    name: "user1",
    position: "Developer",
    code: "aaa",
  },
];

export default function CollaborateButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const store = useFunctionStore((state) => state);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const [memberList, setMemberList] = useState(data);

  return (
    <>
      <Button
        rounded={"full"}
        size={"xs"}
        textColor={"#219BF4"}
        bg={"rgba(54, 173, 239, 0.10)"}
        px={3}
        _hover={{
          bg: "#AFDEF9",
        }}
        // isLoading={functionDetailQuery.isFetching}
        disabled={store.getFunctionUrl() === ""}
        onClick={() => {
          onOpen();
        }}
        leftIcon={<CollaborateIcon />}
      >
        <Trans
          t={t}
          i18nKey="Collaborate.Invite"
          values={{
            number: 2,
          }}
        />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <span>{t("Collaborate.InviteMembers")}</span>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <div className="flex justify-center border-b pb-5">
              <div
                className={clsx(
                  "mr-2 flex w-36 items-center justify-center rounded-lg border border-grayModern-200",
                  darkMode ? "" : "bg-[#F4F6F8]",
                )}
              >
                Developer
                <ChevronDownIcon className="ml-1" />
              </div>
              <Button
                className="!rounded-lg !px-20 !text-lg !font-medium"
                leftIcon={<LinkIcon />}
                onClick={() => {
                  setMemberList([
                    ...memberList,
                    { id: 5, name: "", position: "", code: "AVjdXULSDD" },
                  ]);
                }}
              >
                {t("Collaborate.GenerateInvitationLink")}
              </Button>
            </div>
            <div className="mt-5">
              <span className="text-xl font-medium">{t("Collaborate.Members")}</span>
            </div>
            {data.length === 0 ? (
              <EmptyBox>
                <div>{t("Collaborate.NoMembers")}</div>
              </EmptyBox>
            ) : (
              <div className="max-h-[300px] min-h-[150px] overflow-auto">
                {memberList.map((member) => (
                  <div key={member.id} className="mt-4 flex items-center justify-between text-lg">
                    <span className="flex items-center">
                      <Avatar
                        boxSize="36px"
                        border={"2px solid #DEE0E2"}
                        mr="2"
                        name={member.name}
                      />
                      <p>{member.name === "" ? member.code : member.name}</p>
                    </span>
                    <span className="flex items-center">
                      {member.name !== "" ? (
                        <>
                          <p className="pr-2">{member.position}</p>
                          <ChevronDownIcon className="mr-5 cursor-pointer" />
                        </>
                      ) : (
                        <CopyText text={member.code} className="mr-4 cursor-pointer text-[#219BF4]">
                          <span>
                            <CopyIcon className="mr-2" />
                            {t("Collaborate.CopyLink")}
                          </span>
                        </CopyText>
                      )}

                      <MoreButton
                        isHidden={false}
                        label={t("Operation")}
                        className="!w-[60px] !px-0"
                      >
                        <div className="cursor-pointer text-[12px] text-error-500 hover:text-error-600">
                          {member.name !== "" ? t("Collaborate.Remove") : t("Collaborate.Revoke")}
                        </div>
                      </MoreButton>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
