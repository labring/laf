import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { Field, Formik } from "formik";

import IconWrap from "@/components/IconWrap";

function CreateModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const formRef = React.useRef(null);

  const initialRef = React.useRef(null);

  return (
    <>
      <Button size="xs" onClick={onOpen}>新建文件夹</Button>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Folder</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              name: "",
            }}
            onSubmit={(values) => {}}
          >
            {({ handleSubmit, errors, touched }) => (
              <form ref={formRef} onSubmit={handleSubmit}>
                <ModalBody pb={6}>
                  <VStack spacing={6} align="flex-start">
                    <FormControl>
                      <FormLabel htmlFor="name">文件夹名称</FormLabel>
                      <Field as={Input} id="name" name="name" variant="filled" />
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
}

export default CreateModal;
