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
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { Field, Formik } from "formik";
import useGlobalStore from "pages/globalStore";

import IconWrap from "@/components/IconWrap";

import useStorageStore from "../../store";

function CreateBucketModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { createStorage, initStoragePage } = useStorageStore((state) => state);
  const formRef = React.useRef(null);

  const { showSuccess } = useGlobalStore();

  return (
    <>
      <IconWrap size={20} onClick={onOpen} tooltip="创建 Bucket">
        <AddIcon fontSize={10} />
      </IconWrap>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Bucket</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              policy: "readonly",
            }}
            onSubmit={async (values: any) => {
              values.storage = values.storage + "Gi";
              const res = await createStorage(values);
              if (!res.error) {
                showSuccess("create success.");
                onClose();
                initStoragePage();
              }
            }}
          >
            {({ handleSubmit, errors, touched }) => (
              <form ref={formRef} onSubmit={handleSubmit}>
                <ModalBody pb={6}>
                  <VStack spacing={6} align="flex-start">
                    <FormControl>
                      <FormLabel htmlFor="shortName">Bucket名称</FormLabel>
                      <Field as={Input} id="shortName" name="shortName" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="policy">权限</FormLabel>
                      <Field as={Select} id="policy" name="policy" variant="filled">
                        <option value="private">私有</option>
                        <option value="readonly">公共读</option>
                        <option value="readwrite">公共读写</option>
                      </Field>
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="storage">容量</FormLabel>
                      <Field as={InputGroup}>
                        <Input
                          id="storage"
                          type="number"
                          name="storage"
                          variant="filled"
                          className="w-1"
                        />
                        <InputRightElement children="GB" />
                      </Field>
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

export default CreateBucketModal;
