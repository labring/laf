import React from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";

function DrawerExample() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, handleSubmit } = useForm();

  return (
    <>
      <Button size="xs" onClick={onOpen}>
        网站托管
      </Button>

      <Drawer isOpen={isOpen} placement="right" size={"md"} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>网站托管</DrawerHeader>

          <DrawerBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired>
                <FormLabel htmlFor="siteName">网站名称</FormLabel>
                <Input
                  {...register("siteName", {
                    required: true,
                  })}
                  id="siteName"
                  variant="filled"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="bucketName">Bucket</FormLabel>
                <Input
                  {...register("bucketName", {
                    required: true,
                  })}
                  id="name"
                  variant="filled"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="domainName">域名</FormLabel>
                <Input
                  {...register("domainName", {
                    required: true,
                  })}
                  id="domainName"
                  variant="filled"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="customDomain">自定义域名</FormLabel>
                <Input
                  {...register("customDomain", {
                    required: true,
                  })}
                  id="customDomain"
                  variant="filled"
                />
              </FormControl>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t(" Cancel")}
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit(() => {})}>
              {t(" Confirm")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default DrawerExample;
