import React from "react";
import { useTranslation } from "react-i18next";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
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

import { GithubIcon, HeartIcon, PhoneIcon, WechatIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

import MonacoEditor from "./MonacoEditor";
import TemplateList from "./TemplateList";

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

                  <TemplateList title="最近使用" data={data_recent} />
                  <TemplateList title="我的模板" data={data_star} />
                  <TemplateList title="推荐模板" data={data_recommend} />
                </div>
              </VStack>
              <VStack className="relative h-full w-full">
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

              <VStack className="h-full w-5/12">
                <Box className="flex w-full justify-between pb-8">
                  <div className="flex cursor-pointer items-center rounded-2xl border-2 px-3 text-xl">
                    <HeartIcon />
                    <span className="pl-1">112</span>
                  </div>
                  <Button>{t("Template.useTemplate")}</Button>
                </Box>
                <Box className="w-full">
                  <span className="text-xl font-bold">{t("Template.DeveloperInformation")}</span>
                  <Box className="flex h-20 items-center justify-between">
                    <div className="flex">
                      <img src="/logo.png" alt="avatar" className="w-10" />
                      <div className="pl-2">
                        <span className="text-lg font-semibold">laf-test</span>
                        <div>
                          <GithubIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                          <WechatIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                          <PhoneIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                        </div>
                      </div>
                    </div>
                    <button className="h-6 w-16 rounded-3xl bg-primary-200 font-semibold text-primary-600">
                      {t("Template.Sponsor")}
                    </button>
                  </Box>
                </Box>
                <Box className="w-full">
                  <span className="text-xl font-bold">{t("Template.Function")}</span>
                  <Box>
                    <div className="flex h-8 items-center font-medium">
                      {/* <span className="text-blue-600 pr-2 text-xs">TS</span> */}
                      <FileTypeIcon type="ts" />
                      <span className="pl-1 text-lg">register</span>
                    </div>
                    <div className="flex h-8 items-center font-medium">
                      <FileTypeIcon type="ts" />
                      <span className="pl-1 text-lg">login</span>
                    </div>
                  </Box>
                </Box>
                <Box className="w-full">
                  <span className="text-xl font-bold">{t("Template.Dependency")}</span>
                  <Box>
                    <div className="flex h-8 items-center justify-between font-medium">
                      <div className="flex items-center">
                        <FileTypeIcon type="npm" />
                        <span className="pl-1">ChatGPT</span>
                      </div>
                      <span>5.2.1</span>
                    </div>
                  </Box>
                </Box>
                <Box className="w-full">
                  <span className="text-xl font-bold">{t("Template.EnvironmentVariables")}</span>
                  <Box>
                    <div className="flex h-8 items-center font-medium">OPEN_AI_KEY</div>
                  </Box>
                </Box>
                {/* <Box className="w-full">
                  <span className="text-xl font-bold">Used by</span>
                  
                </Box> */}
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
