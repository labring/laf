import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
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

import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";
import TemplateInfo from "@/pages/functionTemplate/Mods/TemplateInfo";
import TemplateList from "@/pages/functionTemplate/Mods/TemplateList";

const FunctionTemplate = (props: { children?: React.ReactElement }) => {
  const data_recent = [
    {
      name: "test",
      code: "",
    },
    {
      name: "test2",
      code: "",
    },
  ];
  const data_star = [
    {
      name: "test1",
      code: "",
    },
  ];
  const data_recommend = [
    {
      name: "空白模板",
      code: "",
    },
    {
      name: "数据库操作",
      code: "",
    },
    {
      name: "用户登录和注册",
      code: "",
    },
    {
      name: "ChatGPT示例",
      code: "",
    },
    {
      name: "文件上传",
      code: "",
    },
  ];

  const [selectedItem, setSelectedItem] = useState(data_recent[0]);
  const { onOpen, isOpen, onClose } = useDisclosure();
  const { children } = props;
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("market.funcTemplate")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <HStack spacing={6} className="h-[500px] justify-between">
              <VStack className="h-full w-3/12">
                <div>
                  <InputGroup className="pb-4">
                    <InputLeftElement
                      height={"8"}
                      left="1"
                      pointerEvents="none"
                      children={<Search2Icon color="#7B838B" fontSize={16} />}
                    />
                    <Input
                      rounded={"100px"}
                      placeholder={String(t("Search"))}
                      variant="outline"
                      borderWidth={"1px"}
                      height={"8"}
                      width={"44"}
                      backgroundColor={"#F6F8F9"}
                    />
                  </InputGroup>

                  <TemplateList
                    title={"最近使用"}
                    data={data_recent}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                  />
                  <TemplateList
                    title={"我的模板"}
                    data={data_star}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                  />
                  <TemplateList
                    title={"推荐模板"}
                    data={data_recommend}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                  />
                </div>
              </VStack>
              <VStack className="relative h-full w-8/12">
                <Box className="absolute bottom-20 top-0 w-full">
                  <div className="pb-2 text-xl font-semibold">用户登录和注册</div>
                  <div className="pb-2 text-second">获取用户登录信息</div>
                  <MonacoEditor
                    value={`import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  console.log('server side code')
  return { data: 'hi, laf' }
}
`}
                    title="register"
                    readOnly={false}
                    colorMode={colorMode}
                  />
                </Box>
              </VStack>
              <VStack className="h-full w-3/12">
                <TemplateInfo author="laf-test" functionList={[]} packageList={[]} />
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
