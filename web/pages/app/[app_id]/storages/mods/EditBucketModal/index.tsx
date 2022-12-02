import React from "react";
import { EditIcon } from "@chakra-ui/icons";
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

function EditBucketModal(props: { storage: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { storage } = props;
  const formRef = React.useRef(null);
  const { showSuccess } = useGlobalStore();

  const { updateStorage } = useStorageStore((state) => state);

  const initialRef = React.useRef(null);

  return (
    <>
      <IconWrap onClick={onOpen}>
        <EditIcon fontSize={12} />
      </IconWrap>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Bucket</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              name: storage?.metadata?.name,
              policy: storage?.spec?.policy,
              storage: storage?.spec?.storage,
            }}
            onSubmit={async (values: any) => {
              const res = await updateStorage(values);
              if (!res.error) {
                showSuccess("update success.");
                onClose();
              }
            }}
          >
            {({ handleSubmit, errors, touched }) => (
              <form ref={formRef} onSubmit={handleSubmit}>
                <ModalBody pb={6}>
                  <VStack spacing={6} align="flex-start">
                    <FormControl>
                      <FormLabel htmlFor="name">Bucket名称</FormLabel>
                      <Field as={Input} id="name" name="name" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="policy">权限</FormLabel>
                      <Field
                        as={Select}
                        id="policy"
                        name="policy"
                        variant="filled"
                        isDisabled={true}
                      >
                        <option value="private">私有</option>
                        <option value="public-read">公共读</option>
                        <option value="public-read-write">公共读写</option>
                      </Field>
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="storage">容量</FormLabel>
                      <Field as={InputGroup}>
                        <Input
                          id="storage"
                          name="storage"
                          variant="filled"
                          className="w-1"
                          type="number"
                          isDisabled={true}
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

export default EditBucketModal;
