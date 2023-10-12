import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";

import ConfirmButton from "@/components/ConfirmButton";
import { APP_STATUS } from "@/constants";
import { formatDate } from "@/utils/format";
import getRegionById from "@/utils/getRegionById";

import { useFunctionTemplateUseMutation } from "../../../service";

import { ApplicationControllerFindAll } from "@/apis/v1/applications";
import { ApplicationControllerUpdateState } from "@/apis/v1/applications";
import { DependencyControllerGetDependencies } from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";
import { APP_LIST_QUERY_KEY } from "@/pages/home";
import BundleInfo from "@/pages/home/mods/List/BundleInfo";
import StatusBadge from "@/pages/home/mods/StatusBadge";

const UseTemplateModal = (props: { children: any; templateId: string; packageList: any }) => {
  const { children, templateId, packageList } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { regions, currentApp } = useGlobalStore();
  const { t } = useTranslation();
  const useTemplateMutation = useFunctionTemplateUseMutation();

  const { data: appList, isLoading } = useQuery(
    APP_LIST_QUERY_KEY,
    () => {
      return ApplicationControllerFindAll({});
    },
    {
      enabled: isOpen && !currentApp,
    },
  );

  const { data: dependencies } = useQuery(
    ["dependencies"],
    () => {
      return DependencyControllerGetDependencies({});
    },
    {
      enabled: !!currentApp,
    },
  );

  const updateAppStateMutation = useMutation((params: any) =>
    ApplicationControllerUpdateState(params),
  );

  const handleUseTemplate = async (appItem: any) => {
    const res = await useTemplateMutation.mutateAsync({
      appid: appItem.appid,
      templateId: templateId,
    });

    const isAnyPackageNotInDependencyList = packageList.some((packageItem: string) => {
      const packageName = packageItem.split("@")[0];
      return !dependencies?.data.some((dep: any) => dep.name === packageName);
    });

    if (isAnyPackageNotInDependencyList && packageList.length > 0) {
      updateAppStateMutation.mutate({
        appid: appItem.appid,
        state: appItem.phase === APP_STATUS.Stopped ? APP_STATUS.Running : APP_STATUS.Restarting,
      });
    }

    if (!res.error) {
      window.location.href = `/app/${appItem.appid}/function`;
    }
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: onOpen,
      })}

      <Modal isOpen={isOpen} onClose={onClose} size={!currentApp ? "2xl" : "md"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {!currentApp ? t("Template.Select the application you want to use") : t("Confirm")}
          </ModalHeader>
          <ModalCloseButton />

          {isLoading && !currentApp ? (
            <ModalBody className="flex justify-center">
              <Spinner className="text-grayModern-700" />
            </ModalBody>
          ) : (
            <ModalBody>
              {!currentApp ? (
                <div className="flex flex-col">
                  {appList?.data.map((item: any) => {
                    return (
                      <Box key={item?.appid}>
                        <ConfirmButton
                          headerText={t("Confirm")}
                          confirmButtonText={String(t("Confirm"))}
                          bodyText={t("Template.Confirm")}
                          onSuccessAction={() => handleUseTemplate(item)}
                        >
                          <Box className="group mb-3 flex cursor-pointer items-center rounded-xl border-2 px-3 py-5 hover:border-primary-500 lg:px-6">
                            <div className="w-3/12 ">
                              <div className="text-lg font-bold">{item?.name}</div>
                              <BundleInfo bundle={item.bundle} className="-ml-3" />
                            </div>
                            <div className="w-2/12 font-mono">{item?.appid}</div>
                            <div className="w-2/12 ">
                              <StatusBadge
                                className="!bg-transparent"
                                statusConditions={item?.phase}
                                state={item?.state}
                              />
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
              ) : (
                <div>{t("Template.Confirm")}</div>
              )}
            </ModalBody>
          )}

          <ModalFooter>
            {!currentApp ? null : (
              <Button onClick={() => handleUseTemplate(currentApp)}>{t("Confirm")}</Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UseTemplateModal;
