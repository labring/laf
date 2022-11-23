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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useMutation } from "@tanstack/react-query";

import IconWrap from "@/components/IconWrap";
import request from "@/utils/request";

import { TPackage } from "../../../store";

const AddDepenceModal = forwardRef((_, ref) => {
  const [item, setItem] = useState<TPackage | any>();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef(null);

  const toast = useToast();

  useImperativeHandle(ref, () => ({
    edit: (item: TPackage) => {
      setItem(item);
      onOpen();
    },
  }));

  const mutation = useMutation(
    (params: { name: string; version: string }) => request.post("/api/packages", params),
    {
      onSuccess: () => {
        onClose();
        setItem({
          name: "",
          version: "latest",
        });
        setTimeout(() => {
          toast({
            position: "top",
            title: "依赖添加成功",
            status: "success",
            duration: 2000,
          });
        }, 100);
      },
    },
  );

  return (
    <>
      <IconWrap
        onClick={() => {
          setItem({
            name: "",
            version: "latest",
          });
          onOpen();
        }}
      >
        <AddIcon fontSize={10} />
      </IconWrap>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t`DependenceTitle`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>{t`DependenceName`}</FormLabel>
              <Input
                value={item?.name}
                onChange={(e) =>
                  setItem({
                    ...item,
                    name: e.target.value,
                  })
                }
                ref={initialRef}
                placeholder={t`DependenceName`}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>{t`DependenceVersion`}</FormLabel>
              <Input
                value={item?.version}
                onChange={(e) =>
                  setItem({
                    ...item,
                    version: e.target.value,
                  })
                }
                placeholder={t`DependenceVersion`}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              isLoading={mutation.isLoading}
              mr={3}
              onClick={() => {
                mutation.mutate(item);
              }}
            >
              {t`Confirm`}
            </Button>
            <Button onClick={onClose}>{t`Cancel`}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

AddDepenceModal.displayName = "AddDepenceModal";

export default AddDepenceModal;
