import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";

import ConfirmButton from "@/components/ConfirmButton";
import { APP_STATUS } from "@/constants";
import { formatDate } from "@/utils/format";
import getRegionById from "@/utils/getRegionById";

import { useFunctionTemplateUseMutation } from "../../service";

import {
  ApplicationControllerFindAll,
  ApplicationControllerUpdateState,
} from "@/apis/v1/applications";
import { DependencyControllerGetDependencies } from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";
import { APP_LIST_QUERY_KEY } from "@/pages/home";
import BundleInfo from "@/pages/home/mods/List/BundleInfo";
import StatusBadge from "@/pages/home/mods/StatusBadge";

const UseTemplateModal = (props: { children: any; templateId: string; packageList: any }) => {
  const { children, templateId, packageList } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appList, setAppList] = useState([]);
  const [appid, setAppid] = useState("");
  const { regions, showSuccess } = useGlobalStore();
  const { t } = useTranslation();
  const useTemplateMutation = useFunctionTemplateUseMutation();

  useQuery(
    APP_LIST_QUERY_KEY,
    () => {
      return ApplicationControllerFindAll({});
    },
    {
      onSuccess(data) {
        setAppList(data?.data || []);
      },
    },
  );

  const dependencyList = useQuery(
    ["dependencies", appid],
    () => {
      return DependencyControllerGetDependencies({ appid });
    },
    {
      enabled: !!appid,
    },
  );

  const updateAppStateMutation = useMutation((params: any) =>
    ApplicationControllerUpdateState(params),
  );

  return (
    <>
      {React.cloneElement(children, {
        onClick: (event?: any) => {
          // event?.preventDefault();
          onOpen();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Template.Select the application you want to use")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <div className="flex flex-col">
              {appList.map((item: any) => {
                return (
                  <Box onClick={() => setAppid(item?.appid)} key={item?.appid}>
                    <ConfirmButton
                      headerText={t("Confirm")}
                      confirmButtonText={String(t("Confirm"))}
                      bodyText={t("Template.Confirm")}
                      onSuccessAction={async () => {
                        const res = await useTemplateMutation.mutateAsync({
                          appid: item?.appid,
                          templateId: templateId,
                        });
                        const isAnyPackageNotInDependencyList = packageList.some(
                          (packageItem: any) => !dependencyList.data?.data.includes(packageItem),
                        );
                        if (isAnyPackageNotInDependencyList) {
                          await updateAppStateMutation.mutateAsync({
                            appid: item.appid,
                            state:
                              item.phase === APP_STATUS.Stopped
                                ? APP_STATUS.Running
                                : APP_STATUS.Restarting,
                          });
                        }
                        if (!res.error) {
                          showSuccess(t("Template.UsedSuccessfully"));
                          window.location.href = `/app/${item?.appid}/function`;
                        }
                      }}
                    >
                      <Box className="group mb-3 flex cursor-pointer items-center rounded-xl border-2 px-3 py-5 hover:border-primary-500 lg:px-6">
                        <div className="w-3/12 ">
                          <div className="text-lg font-bold">{item?.name}</div>
                          <BundleInfo bundle={item.bundle} />
                        </div>
                        <div className="w-2/12 font-mono">{item?.appid}</div>
                        <div className="w-2/12 ">
                          <StatusBadge statusConditions={item?.phase} state={item?.state} />
                        </div>
                        <div className="w-2/12 ">
                          {getRegionById(regions, item.regionId)?.displayName}
                        </div>
                        <div className="w-4/12 ">
                          <p>
                            {t("CreateTime")}: {formatDate(item.createdAt)}{" "}
                          </p>
                        </div>
                      </Box>
                    </ConfirmButton>
                  </Box>
                );
              })}
            </div>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UseTemplateModal;
