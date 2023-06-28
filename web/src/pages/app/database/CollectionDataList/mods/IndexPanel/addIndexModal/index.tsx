import { useState } from "react";
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
  Radio,
  RadioGroup,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

function AddIndexModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [indexName, setIndexName] = useState("");
  const [indexType, setIndexType] = useState("");
  const [indexField, setIndexField] = useState("");
  return (
    <>
      <Button onClick={onOpen} colorScheme="primary" size="sm">
        <AddIcon color="white" className="mr-2" />
        {t("CollectionPanel.AddIndex")}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("CollectionPanel.AddIndex")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>{t("CollectionPanel.IndexName")}</FormLabel>
              <Input
                className="h-14"
                value={indexName}
                onChange={(e) => setIndexName(e.target.value)}
                placeholder=""
              />
            </FormControl>

            <FormControl className="mt-8">
              <FormLabel>索引属性</FormLabel>
              <RadioGroup onChange={setIndexType} value={indexType}>
                <Stack direction="row">
                  <Radio value="1">唯一</Radio>
                  <Radio value="2">非唯一</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl className="mt-8">
              <FormLabel>索引字段</FormLabel>
              <Input
                value={indexField}
                onChange={(e) => setIndexField(e.target.value)}
                placeholder=""
              />
            </FormControl>
          </ModalBody>
          <ModalFooter className="mt-20">
            <Button mr={3} onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button variant="ghost">{t("Confirm")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
export default AddIndexModal;
