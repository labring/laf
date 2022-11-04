import React, { useState } from "react";
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

import IconWrap from "@/components/IconWrap";
import { t } from "@lingui/macro";
import { useMutation } from "@tanstack/react-query";
import request from "@/utils/request";

function AddDepenceModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef(null);

  const [name, setName] = useState("");
  const [version, setVersion] = useState("latest");

  const toast = useToast();

  const mutation = useMutation(
    (params: { name: string; version: string }) => request.post("/api/packages", params),
    {
      onSuccess: () => {
        onClose();
        setName("");
        setVersion("latest");
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
      <IconWrap onClick={onOpen}>
        <AddIcon />
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                ref={initialRef}
                placeholder={t`DependenceName`}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>{t`DependenceVersion`}</FormLabel>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
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
                mutation.mutate({
                  name,
                  version,
                });
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
}

export default AddDepenceModal;
