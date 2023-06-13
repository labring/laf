import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { TemplateList, TFunctionTemplate } from "@/apis/typing";
import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";
import TemplateInfo from "@/pages/functionTemplate/Mods/TemplateInfo";
import TemplateNameList from "@/pages/functionTemplate/Mods/TemplateList";
import { useGetFunctionTemplateUsedByQuery } from "@/pages/functionTemplate/service";
import { useGetMyFunctionTemplatesQuery } from "@/pages/my/service";

const FunctionTemplate = (props: { children?: React.ReactElement }) => {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const { children } = props;
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const [myTemplateList, setMyTemplateList] = useState<TemplateList>();
  const [myStarTemplateList, setMyStarTemplateList] = useState<TemplateList>();
  const [recentUsedList, setRecentUsedList] = useState<TemplateList>();
  const [recommendList, setRecommendList] = useState<TemplateList>();
  const [currentFunctionTemplate, setCurrentFunctionTemplate] = useState<TFunctionTemplate>();
  const [usedBy, setUsedBy] = useState<any[]>([]);

  useGetMyFunctionTemplatesQuery(
    { page: 1, pageSize: 2, recent: 1, recentUsed: true },
    {
      onSuccess: (data: any) => {
        setRecentUsedList(data.data);
        setCurrentFunctionTemplate(data.data.list[0]);
      },
    },
  );
  useGetMyFunctionTemplatesQuery(
    { page: 1, pageSize: 2, recent: 1, stared: true },
    {
      onSuccess: (data: any) => {
        setMyStarTemplateList(data.data);
      },
    },
  );
  useGetMyFunctionTemplatesQuery(
    { page: 1, pageSize: 2, recent: 1 },
    {
      onSuccess: (data: any) => {
        setMyTemplateList(data.data);
      },
    },
  );

  useGetMyFunctionTemplatesQuery(
    { page: 1, pageSize: 2, recent: 1, hot: true },
    {
      onSuccess: (data: any) => {
        setRecommendList(data.data);
      },
    },
  );

  useGetFunctionTemplateUsedByQuery(
    { page: 1, pageSize: 2, recent: 1, id: currentFunctionTemplate?._id },
    {
      enabled: !!currentFunctionTemplate,
      onSuccess: (data: any) => {
        setUsedBy(data.data.list);
      },
    },
  );

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("market.funcTemplate")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <HStack spacing={6} className="h-[500px] justify-between">
              <VStack className="h-full w-2/12">
                <TemplateNameList
                  title={t("Template.recentUsed")}
                  data={recentUsedList?.list}
                  selectedItem={currentFunctionTemplate}
                  setSelectedItem={setCurrentFunctionTemplate}
                />
                <TemplateNameList
                  title={t("Template.myStar")}
                  data={myStarTemplateList?.list}
                  selectedItem={currentFunctionTemplate}
                  setSelectedItem={setCurrentFunctionTemplate}
                />
                <TemplateNameList
                  title={t("Template.myTemplate")}
                  data={myTemplateList?.list}
                  selectedItem={currentFunctionTemplate}
                  setSelectedItem={setCurrentFunctionTemplate}
                />
                <TemplateNameList
                  title={t("Template.recommend")}
                  data={recommendList?.list}
                  selectedItem={currentFunctionTemplate}
                  setSelectedItem={setCurrentFunctionTemplate}
                />
              </VStack>
              <VStack className="relative h-full w-8/12">
                <Box className="absolute bottom-20 top-0 w-full px-2">
                  <div className="pb-2 text-xl font-semibold">{currentFunctionTemplate?.name}</div>
                  <div className="pb-2 text-second">{currentFunctionTemplate?.description}</div>
                  <div className="h-[450px] overflow-scroll scroll-auto">
                    {currentFunctionTemplate?.items?.map((item: any) => {
                      return (
                        <div className="mb-2 h-4/5">
                          <MonacoEditor
                            value={item?.source.code}
                            title={item?.name}
                            readOnly={false}
                            colorMode={colorMode}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Box>
              </VStack>
              <VStack className="h-full w-2/12">
                {currentFunctionTemplate && (
                  <TemplateInfo functionTemplate={currentFunctionTemplate} usedBy={usedBy} />
                )}
              </VStack>
            </HStack>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FunctionTemplate;
