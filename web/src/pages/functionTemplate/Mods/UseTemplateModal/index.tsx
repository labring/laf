import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
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

import { ApplicationControllerFindAll } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";
import { APP_LIST_QUERY_KEY } from "@/pages/home";
import BundleInfo from "@/pages/home/mods/List/BundleInfo";
import StatusBadge from "@/pages/home/mods/StatusBadge";

const UseTemplateModal = (props: { children: any }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appList, setAppList] = useState([]);
  const { regions } = useGlobalStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      {React.cloneElement(props.children, {
        onClick: (event?: any) => {
          event?.preventDefault();
          // reset(defaultValues);
          onOpen();
          // setTimeout(() => {
          //   setFocus("name");
          // }, 0);
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>选择你要使用的应用</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <div className="flex flex-col">
              {appList.map((item: any) => {
                return (
                  <Box
                    key={item?.appid}
                    className="group mb-3 flex cursor-pointer items-center rounded-xl border-2 px-3 py-5 hover:border-primary-500 lg:px-6"
                    onClick={() => {
                      console.log(item?.appid);
                      navigate(`/app/${item?.appid}/function`);
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
