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
import { sortBy } from "lodash";

import ChargeButton from "@/components/ChargeButton";
// import ChargeButton from "@/components/ChargeButton";
import { APP_STATUS } from "@/constants/index";
import { formatPrice } from "@/utils/format";

import { APP_LIST_QUERY_KEY } from "../..";
import { useAccountQuery } from "../../service";

import BundleItem from "./BundleItem";
import RuntimeItem from "./RuntimeItem";

import { TApplicationItem, TBundle } from "@/apis/typing";
import { ApplicationControllerUpdate } from "@/apis/v1/applications";
import { SubscriptionControllerCreate, SubscriptionControllerRenew } from "@/apis/v1/subscriptions";
import useGlobalStore from "@/pages/globalStore";

const CreateAppModal = (props: {
  type: "create" | "edit" | "renewal";
  application?: TApplicationItem;
  children: React.ReactElement;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application, type } = props;

  const title = type === "edit" ? t("Edit") : type === "renewal" ? t("Renew") : t("Create");

  const { runtimes = [], regions = [] } = useGlobalStore();

  const accountQuery = useAccountQuery();

  type FormData = {
    name: string;
    state: APP_STATUS | string;
    regionId: string;
    bundleId: string;
    runtimeId: string;
    subscriptionOption:
      | {
          id: string;
        }
      | any;
  };

  const currentRegion =
    regions.find((item: any) => item.id === application?.regionId) || regions[0];

  const bundles = sortBy(currentRegion.bundles, (item: TBundle) => item.priority);

  let defaultValues = {
    name: application?.name,
    state: application?.state,
    regionId: application?.regionId,
    bundleId: application?.bundle?.bundleId,
    subscriptionOption: bundles.find((item: TBundle) => item.id === application?.bundle?.bundleId)
      ?.subscriptionOptions[0],
    runtimeId: runtimes[0].id,
  };

  if (type === "create") {
    defaultValues = {
      name: "",
      state: APP_STATUS.Running,
      regionId: regions[0].id,
      bundleId: bundles[0].id,
      subscriptionOption:
        (bundles[0].subscriptionOptions && bundles[0].subscriptionOptions[0]) || {},
      runtimeId: runtimes[0].id,
    };
  }

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

  const bundleId = useWatch({
    control,
    name: "bundleId",
  });

  const currentBundle: TBundle =
    bundles.find((item: TBundle) => item.id === bundleId) || bundles[0];

  const subscriptionOption = useWatch({
    control,
    name: "subscriptionOption",
    defaultValue: currentBundle.subscriptionOptions[0],
  });

  const currentSubscription = currentBundle.subscriptionOptions[0];

  const { showSuccess, showError } = useGlobalStore();

  const totalPrice = subscriptionOption.specialPrice;

  const subscriptionControllerCreate = useMutation((params: any) =>
    SubscriptionControllerCreate(params),
  );
  const subscriptionOptionRenew = useMutation((params: any) => SubscriptionControllerRenew(params));

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdate(params));

  const onSubmit = async (data: any) => {
    let res: any = {};
    switch (type) {
      case "edit":
        res = await updateAppMutation.mutateAsync({ ...data, appid: application?.appid });
        break;

      case "create":
        res = await subscriptionControllerCreate.mutateAsync({
          ...data,
          duration: subscriptionOption.duration,
        });
        break;

      case "renewal":
        res = await subscriptionOptionRenew.mutateAsync({
          id: application?.subscription?.id,
          duration: subscriptionOption.duration,
        });
        break;

      default:
        break;
    }

    if (!res.error) {
      onClose();
      if (type === "edit" || type === "renewal") {
        showSuccess(t("update success"));
      }
      setTimeout(() => {
        queryClient.invalidateQueries(APP_LIST_QUERY_KEY);
      }, 2000);
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
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired isInvalid={!!errors?.name} isDisabled={type === "renewal"}>
                <FormLabel htmlFor="name">{t("HomePanel.Application") + t("Name")}</FormLabel>
                <Input
                  {...register("name", {
                    required: `${t("HomePanel.Application")} ${t("IsRequired")}`,
                  })}
                />
                <FormErrorMessage>{errors?.name && errors?.name?.message}</FormErrorMessage>
              </FormControl>
              <FormControl hidden={type === "edit" || type === "renewal"}>
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
              <FormControl
                isInvalid={!!errors?.bundleId}
                hidden={type === "edit" || type === "renewal"}
              >
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
                                durationIndex={bundle.subscriptionOptions.findIndex(
                                  (vale, index) => {
                                    return vale.displayName === subscriptionOption.displayName;
                                  },
                                )}
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
              {(currentBundle?.notes || []).length > 0 ? (
                <div
                  className="!mt-2"
                  dangerouslySetInnerHTML={{
                    __html: (currentBundle?.notes || []).map((note) => note.content).join(""),
                  }}
                />
              ) : null}

              <FormControl isInvalid={!!errors?.subscriptionOption} hidden={type === "edit"}>
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

                {/* <FormErrorMessage>{errors?.subscriptionOption?.message}</FormErrorMessage> */}
              </FormControl>
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

          <ModalFooter h={20}>
            {type === "edit" ? null : totalPrice <= 0 ? (
              <div className="mr-2">
                <span className="ml-6 text-xl font-semibold text-red-500">{t("Price.Free")}</span>
              </div>
            ) : (
              <div className="mr-2">
                {t("TotalPrice")}:
                <span className="ml-2 text-xl font-semibold text-red-500">
                  {formatPrice(totalPrice)}
                </span>
                <span className="ml-4 mr-2">
                  {t("Balance")}:
                  <span className="ml-2 text-xl">{formatPrice(accountQuery.data?.balance)}</span>
                </span>
                {totalPrice > accountQuery.data?.balance ? (
                  <span className="mr-2">{t("balance is insufficient")}</span>
                ) : null}
                <ChargeButton amount={(totalPrice - accountQuery.data?.balance) / 100}>
                  <span className="cursor-pointer text-lg text-blue-800">{t("ChargeNow")}</span>
                </ChargeButton>
              </div>
            )}

            {type !== "edit" && totalPrice <= accountQuery.data?.balance && (
              <Button
                isLoading={
                  subscriptionControllerCreate.isLoading || subscriptionOptionRenew.isLoading
                }
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={totalPrice > 0}
              >
                {type === "renewal" ? t("Confirm") : t("CreateNow")}
              </Button>
            )}

            {type === "edit" && (
              <Button
                isLoading={updateAppMutation.isLoading}
                type="submit"
                onClick={handleSubmit(onSubmit)}
              >
                {t("Confirm")}
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
