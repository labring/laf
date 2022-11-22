import React from "react";
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
import { t } from "@lingui/macro";
import { Field, Formik } from "formik";

function DrawerExample() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const formRef = React.useRef(null);

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

          <Formik
            initialValues={{
              name: "",
            }}
            onSubmit={(values) => {}}
          >
            {({ handleSubmit, errors, touched }) => (
              <form ref={formRef} onSubmit={handleSubmit}>
                <DrawerBody pb={6}>
                  <VStack spacing={6} align="flex-start">
                    <FormControl>
                      <FormLabel htmlFor="name">网站名称</FormLabel>
                      <Field as={Input} id="name" name="name" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="name">Bucket</FormLabel>
                      <Field as={Input} id="name" name="name" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="name">域名</FormLabel>
                      <Field as={Input} id="name" name="name" variant="filled" />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="name">自定义域名</FormLabel>
                      <Field as={Input} id="name" name="name" variant="filled" />
                    </FormControl>
                  </VStack>
                </DrawerBody>

                <DrawerFooter>
                  <Button variant="outline" mr={3} onClick={onClose}>
                    {t`Cancel`}
                  </Button>
                  <Button colorScheme="blue">{t`Confirm`}</Button>
                </DrawerFooter>
              </form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default DrawerExample;
