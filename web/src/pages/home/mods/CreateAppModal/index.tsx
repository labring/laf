import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
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
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";

import ChargeButton from "@/components/ChargeButton";
import { APP_STATUS } from "@/constants/index";

import BundleItem from "./BundleItem";
import RuntimeItem from "./RuntimeItem";

import { TBundle } from "@/apis/typing";
import { ApplicationControllerCreate, ApplicationControllerUpdate } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

const CreateAppModal = (props: { application?: any; children: React.ReactElement }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application = {} } = props;
  const isEdit = !!application.name;

  const { runtimes = [], regions = [] } = useGlobalStore();

  type FormData = {
    name: string;
    state: APP_STATUS;
    region: string;
    bundleName: string;
    runtimeName: string;
    duration: string;
  };

  const bundles = regions[0].bundles;

  const defaultValues = {
    name: application.name,
    state: application.state || APP_STATUS.Running,
    region: application.regionName || regions[0].name,
    bundleName: application.bundleName || bundles[0].name,
    duration: "1",
    runtimeName: runtimes[0].name,
  };

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const duration = useWatch({
    control,
    name: "duration", // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
  });

  const bundleName = useWatch({
    control,
    name: "bundleName", // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
  });

  const { showSuccess, showError } = useGlobalStore();

  const appCreateMutation = useMutation((params: any) => ApplicationControllerCreate(params));

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdate(params));

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit) {
      res = await updateAppMutation.mutateAsync({ ...data, appid: application.appid });
    } else {
      res = await appCreateMutation.mutateAsync(data);
    }

    if (!res.error) {
      onClose();
      if (isEdit) {
        showSuccess(t("update success"));
      }
      queryClient.invalidateQueries(["appListQuery"]);
    } else {
      showError(res.error);
    }
  };

  const currentBundle = bundles.find((item: TBundle) => item.name === bundleName);
  const totalPrice = parseInt(duration, 10) * currentBundle.price;

  return (
    <>
      {React.cloneElement(props.children, {
        onClick: (event?: any) => {
          event?.preventDefault();
          reset(defaultValues);
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? t("Edit") : t("Create")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">{t("HomePanel.Application") + t("Name")}</FormLabel>
                <Input
                  {...register("name", {
                    required: `${t("HomePanel.Application")} ${t("IsRequired")}`,
                  })}
                />
                <FormErrorMessage>{errors?.name && errors?.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="region">{t("HomePanel.Region")}</FormLabel>
                <HStack spacing={6}>
                  <Controller
                    name="region"
                    control={control}
                    render={({ field: { ref, ...rest } }) => {
                      return (
                        <div>
                          {regions.map((region: any) => {
                            return (
                              <div className="flex items-center" key={region.name}>
                                <Button
                                  variant={"ghost"}
                                  size="sm"
                                  colorScheme={rest.value === region.name ? "primary" : "gray"}
                                  key={region.name}
                                >
                                  <CheckIcon className="mr-2" />
                                  {region.displayName}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                    rules={{
                      required: { value: true, message: t("LimitSelect") },
                    }}
                  />
                </HStack>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors?.bundleName}>
                <FormLabel htmlFor="bundleName">
                  {t("HomePanel.Application") + t("HomePanel.BundleName")}
                </FormLabel>
                <HStack spacing={"12px"}>
                  <Controller
                    name="bundleName"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <>
                          {(bundles || []).map((bundle: TBundle) => {
                            return (
                              <BundleItem
                                onChange={onChange}
                                bundle={bundle}
                                isActive={bundle.name === value}
                                key={bundle.name}
                              />
                            );
                          })}
                        </>
                      );
                    }}
                    rules={{
                      required: { value: true, message: t("LimitSelect") },
                    }}
                  />
                </HStack>
                <FormErrorMessage>{errors?.bundleName?.message}</FormErrorMessage>
              </FormControl>

              {bundleName !== "standard" ? (
                <FormControl isRequired isInvalid={!!errors?.duration}>
                  <FormLabel htmlFor="duration">{t("HomePanel.Duration")}</FormLabel>
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <RadioGroup onChange={onChange} value={value}>
                        <Stack direction="row" spacing={8}>
                          <Radio value="1">1个月</Radio>
                          <Radio value="3">3个月</Radio>
                          <Radio value="6">半年</Radio>
                          <Radio value="12">1年</Radio>
                        </Stack>
                      </RadioGroup>
                    )}
                  />

                  <FormErrorMessage>{errors?.duration?.message}</FormErrorMessage>
                </FormControl>
              ) : null}

              <FormControl isRequired isInvalid={!!errors?.runtimeName}>
                <FormLabel htmlFor="runtimeName">{t("HomePanel.RuntimeName")}</FormLabel>
                <Controller
                  name="duration"
                  control={control}
                  render={({}) => {
                    return (
                      <HStack spacing={"2"}>
                        {(runtimes || []).map((runtime: any) => {
                          return <RuntimeItem key={runtime.name} />;
                        })}
                      </HStack>
                    );
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            {bundleName === "standard" ? (
              <div className="mr-2">
                <span className="ml-6 text-red-500 font-semibold text-xl">Free</span>
              </div>
            ) : (
              <div className="mr-2">
                账户余额: ¥ 0
                <ChargeButton>
                  <span>立即充值</span>
                </ChargeButton>
                <span className="ml-6 text-red-500 font-semibold text-xl">{totalPrice}</span>
              </div>
            )}

            <Button
              isLoading={appCreateMutation.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={totalPrice > 0}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
