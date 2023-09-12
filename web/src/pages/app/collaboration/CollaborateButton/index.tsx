import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CopyIcon, LinkIcon } from "@chakra-ui/icons";
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
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import { CollaborateIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import MoreButton from "@/components/MoreButton";
import { COLOR_MODE } from "@/constants";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import useFunctionStore from "../../functions/store";
import {
  useGroupCodeQuery,
  useGroupInviteCodeDeleteMutation,
  useGroupInviteCodeGenerateMutation,
  useGroupInviteCodeQuery,
  useGroupMemberLeaveMutation,
  useGroupMemberRemoveMutation,
  useGroupMembersQuery,
} from "../service";

import useGlobalStore from "@/pages/globalStore";

type TMember = {
  _id: string;
  uid: string;
  groupId: string;
  username: string;
  role: string;
  code?: string;
};

type TMemberItemProps = "admin" | "developer" | "owner";

export default function CollaborateButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const store = useFunctionStore((state) => state);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const [memberList, setMemberList] = useState<TMember[]>([]);
  const [codeList, setCodeList] = useState<TMember[]>([]);
  const [groupId, setGroupId] = useState("");
  const memberType: TMemberItemProps = "developer";
  const navigate = useNavigate();

  const generateInviteCode = useGroupInviteCodeGenerateMutation();
  const deleteInviteCode = useGroupInviteCodeDeleteMutation();
  const removeMember = useGroupMemberRemoveMutation();
  const leaveGroup = useGroupMemberLeaveMutation();

  const queryClient = useQueryClient();
  const { showSuccess, currentApp, userInfo } = useGlobalStore();

  const isOwner = () => {
    return currentApp.createdBy === userInfo?._id;
  };

  useGroupCodeQuery({
    onSuccess: (data) => {
      setGroupId(data.data._id);
    },
  });

  useGroupMembersQuery(
    {
      groupId,
    },
    {
      enabled: !!groupId,
      onSuccess: (data) => {
        setMemberList(data.data);
      },
    },
  );

  useGroupInviteCodeQuery(
    {
      groupId,
    },
    {
      enabled: isOpen && isOwner(),
      onSuccess: (data) => {
        setCodeList(data.data);
      },
    },
  );

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
            number: memberList.length,
          }}
        />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <span>{isOwner() ? t("Collaborate.InviteMembers") : t("Collaborate.Members")}</span>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            {isOwner() && (
              <>
                <div className="flex justify-center border-b pb-5">
                  <div
                    className={clsx(
                      "mr-2 flex w-36 items-center justify-center rounded-lg border border-grayModern-200",
                      darkMode ? "" : "bg-[#F4F6F8]",
                    )}
                  >
                    {memberType.charAt(0).toUpperCase() + memberType.slice(1)}
                    {/* <ChevronDownIcon className="ml-1" /> */}
                  </div>
                  <Button
                    className="!rounded-lg !px-20 !text-lg !font-medium"
                    leftIcon={<LinkIcon />}
                    onClick={async () => {
                      const res = await generateInviteCode.mutateAsync({
                        groupId,
                        role: memberType,
                      });

                      if (!res.error) {
                        showSuccess(t("Collaborate.GenerateInvitationLinkSuccess"));
                      }
                      queryClient.invalidateQueries(["useGroupInviteCodeQuery"]);
                    }}
                  >
                    {t("Collaborate.GenerateInvitationLink")}
                  </Button>
                </div>
                <div className="mt-5">
                  <span className="text-xl font-medium">{t("Collaborate.Members")}</span>
                </div>
              </>
            )}
            <div className="max-h-[300px] min-h-[150px] overflow-auto">
              {[...memberList, ...(codeList || [])].map((member) => (
                <div
                  key={member.uid || member._id}
                  className="mt-4 flex items-center justify-between text-lg"
                >
                  <span className="flex items-center">
                    {!!member.uid ? (
                      <Avatar
                        boxSize="32px"
                        border={"2px solid #DEE0E2"}
                        mr="2"
                        name={member.username}
                        bgColor="primary.500"
                        color="white"
                        src={getAvatarUrl(member.uid)}
                      />
                    ) : (
                      <div className="mr-2 h-8 w-8 rounded-full border-2 border-dashed border-grayModern-300" />
                    )}
                    <p>{!member.username ? member.code : member.username}</p>
                  </span>
                  <span className="flex items-center">
                    {member.username ? (
                      <>
                        <p
                          className={clsx(
                            "mr-4 rounded-lg px-2 py-1",
                            member.role === "owner" && "bg-adora-100 text-adora-600",
                            member.role === "admin" && "bg-blue-100 text-[#219BF4]",
                            member.role === "developer" && "bg-primary-100 text-primary-600",
                          )}
                        >
                          {member.role}
                        </p>
                        {/* <ChevronDownIcon className="mr-5 cursor-pointer" /> */}
                      </>
                    ) : (
                      <CopyText
                        text={window.location.origin + "/collaboration/join?code=" + member.code}
                        className="mr-4 cursor-pointer text-[#219BF4]"
                      >
                        <span>
                          <CopyIcon className="mr-2" />
                          {t("Collaborate.CopyLink")}
                        </span>
                      </CopyText>
                    )}

                    <MoreButton
                      isHidden={!isOwner() && !(member.uid === userInfo?._id)}
                      label={t("Operation")}
                      className="!w-[60px] !px-0"
                    >
                      <div
                        className={clsx(
                          "text-[12px]",
                          isOwner() && member.uid === userInfo?._id
                            ? "pointer-events-none  text-grayModern-200"
                            : "cursor-pointer text-error-500 hover:text-error-600",
                        )}
                        onClick={async () => {
                          if (!isOwner() && member.uid === userInfo?._id) {
                            const res = await leaveGroup.mutateAsync({
                              groupId,
                            });

                            if (!res.error) {
                              showSuccess(t("Collaborate.QuitSuccess"));
                              navigate("/dashboard");
                            }
                          } else if (member.code) {
                            const res = await deleteInviteCode.mutateAsync({
                              groupId,
                              code: member.code,
                            });

                            if (!res.error) {
                              showSuccess(t("Collaborate.DeleteLinkSuccess"));
                              queryClient.invalidateQueries(["useGroupInviteCodeQuery"]);
                            }
                          } else {
                            const res = await removeMember.mutateAsync({
                              groupId,
                              userId: member.uid,
                            });

                            if (!res.error) {
                              showSuccess(t("Collaborate.RemoveSuccess"));
                              queryClient.invalidateQueries(["useGroupMembersQuery"]);
                            }
                          }
                        }}
                      >
                        {!isOwner() && member.uid === userInfo?._id
                          ? t("Collaborate.Quit")
                          : member.username
                          ? t("Collaborate.Remove")
                          : t("Collaborate.Revoke")}
                      </div>
                    </MoreButton>
                  </span>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
