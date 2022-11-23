import React, { forwardRef, useImperativeHandle, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { Field, Formik } from "formik";

import IconWrap from "@/components/IconWrap";

import { TFunction } from "../../../store";

const CreateModal = forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const formRef = React.useRef(null);

  const [currentFunc, setCurrentFunc] = useState<TFunction | any>();
  const [isEdit, setIsEdit] = useState(false);

  const initialRef = React.useRef(null);

  useImperativeHandle(ref, () => {
    return {
      edit: (item: TFunction) => {
        setCurrentFunc(item);
        setIsEdit(true);
        onOpen();
      },
    };
  });

  return (
    <>
      <IconWrap
        size={20}
        onClick={() => {
          setCurrentFunc({});
          setIsEdit(false);
          onOpen();
        }}
      >
        <AddIcon fontSize={10} />
      </IconWrap>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加函数</ModalHeader>
          <ModalCloseButton />
          <Formik initialValues={currentFunc} onSubmit={(values) => {}}>
            {({ handleSubmit, errors, touched }) => (
              <form ref={formRef} onSubmit={handleSubmit}>
                <ModalBody pb={6}>
                  <VStack spacing={6} align="flex-start">
                    <FormControl>
                      <FormLabel htmlFor="name">函数名称</FormLabel>
                      <Field as={Input} id="name" name="name" variant="filled" readOnly={isEdit} />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="id">函数标识</FormLabel>
                      <Field as={Input} id="id" name="id" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="tag">标签</FormLabel>
                      <Field as={Input} id="tag" name="tag" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="enabled">是否启用</FormLabel>
                      <Field as={Switch} id="enabled" name="enabled" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="desc">函数描述</FormLabel>
                      <Field as={Textarea} id="desc" name="desc" variant="filled" />
                    </FormControl>
                  </VStack>
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="primary" mr={3} type="submit">
                    {t`Confirm`}
                  </Button>
                  <Button onClick={onClose}>{t`Cancel`}</Button>
                </ModalFooter>
              </form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
});

CreateModal.displayName = "CreateModal";

export default CreateModal;
