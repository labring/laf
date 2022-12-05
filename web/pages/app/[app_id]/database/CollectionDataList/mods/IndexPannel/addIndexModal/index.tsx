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

function AddIndexModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [indexName, setIndexName] = useState("");
  const [indexType, setIndexType] = useState("");
  const [indexField, setIndexField] = useState("");
  return (
    <>
      <Button onClick={onOpen} colorScheme="primary" size="sm">
        <AddIcon color="white" className="mr-2" />
        添加索引
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>创建索引</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>索引名称</FormLabel>
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
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              取消
            </Button>
            <Button variant="ghost">创建</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
export default AddIndexModal;
