import React, { useCallback, useState } from "react";
import { Controller, SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import { AddIcon, ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Button,
  Checkbox,
  CloseButton,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Spacer,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";

import { useCreateIndexMutation } from "../../service";

interface FormData {
  name: string;
  capped: boolean;
  unique: boolean;
  indexTTL: boolean;
  keys: {
    name: string;
    type: 1 | -1 | "text" | "2dsphere";
  }[];
  size: number;
  max: number;
  expireAfterSeconds: number;
}

const AddIndexModal = (props: { children: React.ReactElement }) => {
  const { children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const createIndexMutation = useCreateIndexMutation();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const { register, control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      name: "",
      capped: false,
      unique: false,
      indexTTL: false,
      keys: [
        {
          name: "",
          type: 1,
        },
      ],
      size: 1,
      max: 1,
      expireAfterSeconds: 60 * 60 * 24 * 10,
    },
  });

  const [capped, indexTTL] = useWatch({
    control,
    name: ["capped", "indexTTL"],
  });

  const indexKeys = useFieldArray<FormData>({
    control,
    name: "keys",
    rules: { minLength: 1, required: true },
  });

  const onSubmit: SubmitHandler<FormData> = useCallback(
    async (value) => {
      const keys = value.keys.reduce<Record<string, number | string>>((acc, cur) => {
        acc[cur.name] = Number(cur.type) || cur.type;
        return acc;
      }, {});

      const options: any = {
        unique: value.unique,
      };
      if (value.indexTTL) {
        options["expireAfterSeconds"] = value.expireAfterSeconds;
      }
      if (value.capped) {
        options["capped"] = true;
        options["size"] = value.size;
        options["max"] = value.max;
      }
      if (value.name) {
        options["name"] = value.name;
      }

      await createIndexMutation.mutateAsync({
        keys,
        options,
      });

      onClose();
    },
    [createIndexMutation, onClose],
  );

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          reset();
          onOpen();
        },
      })}
      <Modal onClose={onClose} isOpen={isOpen} useInert>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("CollectionPanel.AddIndex")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack gap={2}>
              <FormControl isRequired>
                <FormLabel>{t("CollectionPanel.IndexKey")}</FormLabel>
                <VStack>
                  {indexKeys.fields.map((v, idx) => (
                    <HStack key={idx} w="full">
                      <Input
                        {...register(`keys.${idx}.name`, {
                          required: true,
                        })}
                      />
                      <Select
                        placeholder={String(t("CollectionPanel.SelectIndexType"))}
                        {...register(`keys.${idx}.type`, {
                          required: true,
                        })}
                      >
                        <option value={1}>1(asc)</option>
                        <option value={-1}>-1(desc)</option>
                        <option value="text">text</option>
                        <option value="2dsphere">2dsphere</option>
                      </Select>
                      {indexKeys.fields.length > 1 && (
                        <CloseButton
                          size="md"
                          onClick={() => {
                            indexKeys.remove(idx);
                          }}
                        />
                      )}
                    </HStack>
                  ))}
                  <Button
                    variant="solid"
                    borderRadius={6}
                    borderStyle="dashed"
                    w="full"
                    my={3}
                    leftIcon={<AddIcon />}
                    onClick={() => {
                      indexKeys.append({
                        name: "",
                        type: 1,
                      });
                    }}
                  >
                    {t("CollectionPanel.AddIndexKey")}
                  </Button>
                </VStack>
              </FormControl>
              <FormControl>
                <FormLabel>
                  {t("CollectionPanel.IndexName")}
                  {` (${t("Optional")})`}
                </FormLabel>
                <Input />
              </FormControl>
              <Divider />

              <FormControl>
                <FormLabel>
                  <div
                    className="cursor-pointer select-none"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdvancedOptions((v) => !v);
                    }}
                  >
                    {!showAdvancedOptions ? (
                      <ChevronRightIcon fontSize={20} />
                    ) : (
                      <ChevronDownIcon fontSize={20} />
                    )}
                    {t("CollectionPanel.AdvancedOptions")}
                  </div>
                </FormLabel>
                {showAdvancedOptions && (
                  <VStack gap={4} mt={4}>
                    <Checkbox alignItems="flex-start" {...register("unique")}>
                      <VStack alignItems="flex-start" className="-mt-1">
                        <h1>{t("CollectionPanel.CreateUniqueIndex")}</h1>
                        <p className="!mt-0 text-gray-400">
                          {t("CollectionPanel.UniqueIndexDescription")}
                        </p>
                      </VStack>
                    </Checkbox>
                    <VStack>
                      <Checkbox alignItems="flex-start" {...register("indexTTL")}>
                        <VStack alignItems="flex-start" className="-mt-1">
                          <h1>{t("CollectionPanel.CreateTTL")}</h1>
                          <p className="!mt-0 text-gray-400">
                            {t("CollectionPanel.TTLDescription")}
                          </p>
                        </VStack>
                      </Checkbox>
                      {indexTTL && (
                        <VStack pl={6} mt={1} spacing={1} alignItems="flex-start" w="full">
                          <FormControl>
                            <Controller
                              name="expireAfterSeconds"
                              control={control}
                              render={({ field: { onChange, value } }) => (
                                <InputGroup size="sm" w={180}>
                                  <NumberInput
                                    value={value}
                                    onChange={(_, num) => {
                                      onChange(num);
                                    }}
                                    min={1}
                                  >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                  <InputRightAddon children={String(t("Second"))} />
                                </InputGroup>
                              )}
                            />
                          </FormControl>
                        </VStack>
                      )}
                    </VStack>
                    <VStack>
                      <Checkbox alignItems="flex-start" {...register("capped")}>
                        <VStack alignItems="flex-start" className="-mt-1">
                          <h1>{t("CollectionPanel.CapacityLimit")}</h1>
                          <p className="!mt-0 text-gray-400">
                            {t("CollectionPanel.CapacityLimitDescription")}
                          </p>
                        </VStack>
                      </Checkbox>
                      {capped && (
                        <VStack pl={6} mt={1} spacing={1} alignItems="flex-start" w="full">
                          <HStack spacing={4}>
                            <FormControl>
                              <Controller
                                name="size"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <InputGroup size="sm" w={160}>
                                    <NumberInput
                                      value={value}
                                      onChange={(_, num) => {
                                        onChange(num);
                                      }}
                                      min={1}
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                    <InputRightAddon children={String(t("Byte"))} />
                                  </InputGroup>
                                )}
                              />
                            </FormControl>
                            <FormControl>
                              <Controller
                                name="max"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <InputGroup size="sm" w={140}>
                                    <NumberInput
                                      value={value}
                                      onChange={(_, num) => {
                                        onChange(num);
                                      }}
                                      min={1}
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                    <InputRightAddon
                                      children={String(t("CollectionPanel.DocumentNum"))}
                                    />
                                  </InputGroup>
                                )}
                              />
                            </FormControl>
                          </HStack>
                        </VStack>
                      )}
                    </VStack>
                  </VStack>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack mt={4}>
              <Button variant="ghost" onClick={onClose}>
                {t("Cancel")}
              </Button>
              <Spacer />
              <Button colorScheme="primary" onClick={handleSubmit(onSubmit)}>
                {t("CollectionPanel.CreateIndex")}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddIndexModal;
