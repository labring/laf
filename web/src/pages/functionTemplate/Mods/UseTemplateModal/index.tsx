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
import { useQuery } from "@tanstack/react-query";

import { formatDate } from "@/utils/format";
import getRegionById from "@/utils/getRegionById";

import { useFunctionTemplateUseMutation } from "../../service";

import { ApplicationControllerFindAll } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";
import { APP_LIST_QUERY_KEY } from "@/pages/home";
import BundleInfo from "@/pages/home/mods/List/BundleInfo";
import StatusBadge from "@/pages/home/mods/StatusBadge";

const UseTemplateModal = (props: { children: any; templateId: string }) => {
  const { children, templateId } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appList, setAppList] = useState([]);
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

  return (
    <>
      {React.cloneElement(children, {
        onClick: (event?: any) => {
          event?.preventDefault();
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
                  <Box
                    key={item?.appid}
                    className="group mb-3 flex cursor-pointer items-center rounded-xl border-2 px-3 py-5 hover:border-primary-500 lg:px-6"
                    onClick={async () => {
                      const res = await useTemplateMutation.mutateAsync({
                        appid: item?.appid,
                        templateId: templateId,
                      });
                      if (!res.error) {
                        showSuccess(t("Template.UsedSuccessfully"));
                        window.location.href = `/app/${item?.appid}/function`;
                      }
                    }}
                  >
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
