import React, { useEffect } from "react";
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
  Stack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";

import ChargeButton from "@/components/ChargeButton";
// import ChargeButton from "@/components/ChargeButton";
import { APP_STATUS } from "@/constants/index";
import { formatPrice } from "@/utils/format";

import { useAccountQuery } from "../../service";

import BundleItem from "./BundleItem";
import RuntimeItem from "./RuntimeItem";

import { TBundle, TSubscriptionOption } from "@/apis/typing";
import { ApplicationControllerUpdate } from "@/apis/v1/applications";
import { SubscriptionControllerCreate } from "@/apis/v1/subscriptions";
import useGlobalStore from "@/pages/globalStore";

const CreateAppModal = (props: { application?: any; children: React.ReactElement }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application = {} } = props;
  const isEdit = !!application.name;

  const { runtimes = [], regions = [] } = useGlobalStore();

  const accountQuery = useAccountQuery();

  type FormData = {
    name: string;
    state: APP_STATUS;
    regionId: string;
    bundleId: string;
    runtimeId: string;
    subscriptionOption: TSubscriptionOption;
  };

  const bundles = regions[0].bundles;

  const defaultValues = {
    name: application.name,
    state: application.state || APP_STATUS.Running,
    regionId: application.regionId || regions[0].id,
    bundleId: application.bundleId || bundles[0].id,
    subscriptionOption: (bundles[0].subscriptionOptions && bundles[0].subscriptionOptions[0]) || {},
    runtimeId: runtimes[0].id,
  };

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const subscriptionOption = useWatch({
    control,
    name: "subscriptionOption",
  });

  const bundleId = useWatch({
    control,
    name: "bundleId",
  });

  const { showSuccess, showError } = useGlobalStore();

  const currentBundle = bundles.find((item: TBundle) => item.id === bundleId) || bundles[0];
  const totalPrice = subscriptionOption.specialPrice;

  const currentSubscription = currentBundle.subscriptionOptions[0];

  const subscriptionControllerCreate = useMutation((params: any) =>
    SubscriptionControllerCreate(params),
  );
  // const subscriptionOptionRenew = useMutation((params: any) => SubscriptionControllerRenew(params));

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdate(params));

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit) {
      res = await updateAppMutation.mutateAsync({ ...data, appid: application.appid });
    } else {
      res = await subscriptionControllerCreate.mutateAsync({
        ...data,
        duration: subscriptionOption.duration,
      });
      // if (res.error) {
      //   showError(res.error);
      //   return;
      // } else {
      //   const subscriptionId = res?.data?.id;
      //   res = await subscriptionOptionRenew.mutateAsync({
      //     id: subscriptionId,
      //     duration: subscriptionOption.duration,
      //   });
      // }
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

  useEffect(() => {
    setValue("subscriptionOption", currentSubscription);
  }, [currentSubscription, setValue]);

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
              <FormControl hidden={isEdit}>
                <FormLabel htmlFor="regionId">{t("HomePanel.Region")}</FormLabel>
                <HStack spacing={6}>
                  <Controller
                    name="regionId"
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
              <FormControl isInvalid={!!errors?.bundleId} hidden={isEdit}>
                <FormLabel htmlFor="bundleId">
                  {t("HomePanel.Application") + t("HomePanel.BundleName")}
                </FormLabel>
                <HStack spacing={"12px"}>
                  <Controller
                    name="bundleId"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <>
                          {(bundles || []).map((bundle: TBundle) => {
                            return (
                              <BundleItem
                                onChange={onChange}
                                bundle={bundle}
                                isActive={bundle.id === value}
                                key={bundle.id}
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
                <FormErrorMessage>{errors?.bundleId?.message}</FormErrorMessage>
              </FormControl>
              (
              <FormControl isInvalid={!!errors?.subscriptionOption}>
                <FormLabel htmlFor="subscriptionOption">{t("HomePanel.Duration")}</FormLabel>
                <Controller
                  name="subscriptionOption"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Stack direction="row" spacing={8}>
                      {(currentBundle.subscriptionOptions || []).map((option) => {
                        return (
                          <span onClick={() => onChange(option)} key={option.displayName}>
                            <Radio isChecked={option.displayName === value.displayName}>
                              {option.displayName}
                            </Radio>
                          </span>
                        );
                      })}
                    </Stack>
                  )}
                />

                <FormErrorMessage>{errors?.subscriptionOption?.message}</FormErrorMessage>
              </FormControl>
              )
              <FormControl isInvalid={!!errors?.runtimeId}>
                <FormLabel htmlFor="runtimeId">{t("HomePanel.RuntimeName")}</FormLabel>
                <Controller
                  name="runtimeId"
                  control={control}
                  render={() => {
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
            {totalPrice <= 0 ? (
              <div className="mr-2">
                <span className="ml-6 text-red-500 font-semibold text-xl">{t("Price.Free")}</span>
              </div>
            ) : (
              <div className="mr-2">
                共需支付:
                <span className="ml-2 text-red-500 font-semibold text-xl">
                  {formatPrice(totalPrice)}
                </span>
                <span className="ml-4 mr-2">
                  账户余额:
                  <span className="text-xl ml-2">{formatPrice(accountQuery.data?.balance)}</span>
                </span>
                {totalPrice > accountQuery.data?.balance ? (
                  <ChargeButton amount={(totalPrice - accountQuery.data?.balance) / 100}>
                    <span className="text-blue-800 cursor-pointer">立即充值</span>
                  </ChargeButton>
                ) : null}
              </div>
            )}

            {totalPrice > accountQuery.data?.balance ? (
              <Button
                isLoading={subscriptionControllerCreate.isLoading}
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={true}
              >
                余额不足
              </Button>
            ) : (
              <Button
                isLoading={subscriptionControllerCreate.isLoading}
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={totalPrice > 0}
              >
                {isEdit ? t("Confirm") : t("CreateNow")}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
