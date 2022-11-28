import React, { forwardRef, useImperativeHandle, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";

const CreateAppModal = forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentFunc, setCurrentFunc] = useState<any | any>();
  const [isEdit, setIsEdit] = useState(false);

  const initialRef = React.useRef(null);

  useImperativeHandle(ref, () => {
    return {
      edit: (item: any) => {
        setCurrentFunc(item);
        setIsEdit(true);
        onOpen();
      },
    };
  });

  return (
    <>
      <Button
        size={"lg"}
        colorScheme="primary"
        style={{ padding: "0 40px" }}
        leftIcon={<AddIcon />}
        onClick={() => {
          setCurrentFunc({});
          setIsEdit(false);
          onOpen();
        }}
      >
        {t`NewApplication`}
      </Button>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加函数</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl>
                <FormLabel htmlFor="name">应用名称</FormLabel>
                <Input />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="id">选择规格</FormLabel>
                <HStack spacing={4}>
                  <Button colorScheme={"green"}>Starter</Button>
                  <Button colorScheme={"green"} variant="outline">
                    Starter
                  </Button>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="tag">初始应用模板</FormLabel>
                <div>
                  <div className="border p-2 rounded mb-4 border-green-600 cursor-pointer">
                    <span className=" text-lg font-bold">空应用</span>
                    <p>不初始化应用模板， 创建一个空应用</p>
                  </div>
                  <div className="border p-2 rounded cursor-pointer">
                    <span className=" text-lg font-bold">App - 高级模板 </span>
                    <p>
                      此模板可直接用于移动应用的开发，提供了常用的云函数，包括用户密码登陆、短信登陆、后台管理RBAC、阿里云短信接口、小程序授权、uni-app
                      热更新等云函数。
                    </p>
                  </div>
                </div>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="primary" mr={3} type="submit">
              {t`Confirm`}
            </Button>
            <Button onClick={onClose}>{t`Cancel`}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
