import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
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
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";

import ChargeButton from "@/components/ChargeButton";
// import ChargeButton from "@/components/ChargeButton";
import { APP_STATUS } from "@/constants/index";
import {
  formatLimitCapacity,
  formatLimitCPU,
  formatLimitMemory,
  formatPrice,
} from "@/utils/format";

import { APP_LIST_QUERY_KEY } from "../..";
import { useAccountQuery } from "../../service";

import BundleItem from "./BundleItem";

import { TApplicationItem, TBundle } from "@/apis/typing";
import { ApplicationControllerUpdate } from "@/apis/v1/applications";
// import { SubscriptionControllerCreate, SubscriptionControllerRenew } from "@/apis/v1/subscriptions";
import useGlobalStore from "@/pages/globalStore";

const CPUSlideMarkList = [
  // The unit of value is m
  { label: 0.1, value: 100 },
  { label: 0.2, value: 200 },
  { label: 0.5, value: 500 },
  { label: 1, value: 1000 },
  { label: 2, value: 2000 },
  { label: 3, value: 3000 },
  { label: 4, value: 4000 },
  { label: 8, value: 8000 },
];

const MemorySlideMarkList = [
  { label: "64M", value: 64 },
  { label: "128M", value: 128 },
  { label: "256M", value: 256 },
  { label: "512M", value: 512 },
  { label: "1G", value: 1024 },
  { label: "2G", value: 2048 },
  { label: "4G", value: 4096 },
  { label: "8G", value: 8192 },
  { label: "16G", value: 16384 },
];

const StorageSlideMarkList = [
  { label: "1G", value: 1024 },
  { label: "4G", value: 1024 * 4 },
  { label: "8G", value: 1024 * 8 },
  { label: "16G", value: 1024 * 16 },
  { label: "32G", value: 1024 * 32 },
  { label: "64G", value: 1024 * 64 },
  { label: "128G", value: 1024 * 128 },
  { label: "256G", value: 1024 * 256 },
  { label: "1T", value: 1024 * 1024 },
];

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

  const bundles = currentRegion.bundles;

  let defaultValues = {
    name: application?.name,
    state: application?.state,
    regionId: application?.regionId,
    bundleId: application?.bundle?.bundleId,
    // subscriptionOption: bundles.find((item: TBundle) => item.id === application?.bundle?.bundleId)
    //   ?.subscriptionOptions[0],
    runtimeId: runtimes[0]._id,
  };

  if (type === "create") {
    defaultValues = {
      name: "",
      state: APP_STATUS.Running,
      regionId: regions[0].id,
      bundleId: bundles[0]._id,

      runtimeId: runtimes[0]._id,
    };
  }

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

  const bundleId = useWatch({
    control,
    name: "bundleId",
  });

  const currentBundle: TBundle =
    bundles.find((item: TBundle) => item._id === bundleId) || bundles[0];

  const [bundle, setBundle] = React.useState<{
    cpu: number;
    memory: number;
    storageCapacity: number;
  }>({
    cpu: currentBundle.spec.cpu.value,
    memory: currentBundle.spec.memory.value,
    storageCapacity: currentBundle.spec.storageCapacity.value,
  });

  const { showSuccess } = useGlobalStore();

  const totalPrice = 10;

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdate(params));

  const onSubmit = async (data: any) => {
    let res: any = {};
    switch (type) {
      case "edit":
        res = await updateAppMutation.mutateAsync({ ...data, appid: application?.appid });
        break;

      case "create":
        // res = await subscriptionControllerCreate.mutateAsync({
        //   ...data,
        //   // duration: subscriptionOption.duration,
        // });
        break;

      case "renewal":
        // res = await subscriptionOptionRenew.mutateAsync({
        //   id: application?.subscription?.id,
        //   // duration: subscriptionOption.duration,
        // });
        break;

      default:
        break;
    }

    if (!res.error) {
      onClose();
      if (type === "edit") {
        showSuccess(t("update success"));
      }
      setTimeout(() => {
        queryClient.invalidateQueries(APP_LIST_QUERY_KEY);
      }, 2000);
    }
  };

  // useEffect(() => {
  //   setValue("subscriptionOption", currentSubscription);
  // }, [currentSubscription, setValue]);

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

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
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
              <FormControl hidden={type === "edit"}>
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
              <FormControl isInvalid={!!errors?.bundleId}>
                <FormLabel htmlFor="bundleId">
                  {t("HomePanel.Application") + t("HomePanel.BundleName")}
                </FormLabel>
                <div>
                  <Controller
                    name="bundleId"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <div className="flex">
                          <div className="flex-col pt-4">
                            {(bundles || []).map((bundle: TBundle) => {
                              return (
                                <BundleItem
                                  onChange={() => {
                                    onChange(bundle._id);
                                    setBundle({
                                      cpu: bundle.spec.cpu.value,
                                      memory: bundle.spec.memory.value,
                                      storageCapacity: bundle.spec.storageCapacity.value,
                                    });
                                  }}
                                  bundle={bundle}
                                  isActive={bundle._id === value}
                                  key={bundle._id}
                                />
                              );
                            })}
                            <BundleItem
                              onChange={onChange}
                              bundle={{
                                displayName: "Custom",
                                _id: "custom",
                              }}
                              isActive={value === "custom"}
                            />
                          </div>
                          <Divider orientation="vertical" h={380} mx={4} />
                          <div className="flex-1 pl-2 pr-6">
                            <div className="mb-12">
                              <p className="mb-2">
                                <span className="mr-2 text-2xl font-semibold">CPU</span>
                                {formatLimitCPU(bundle.cpu)}
                              </p>
                              <Slider
                                min={0}
                                max={CPUSlideMarkList.length - 1}
                                step={1}
                                onChange={(v) => {
                                  setBundle({
                                    ...bundle,
                                    cpu: CPUSlideMarkList[v].value,
                                  });
                                }}
                                value={CPUSlideMarkList.findIndex(
                                  (item) => item.value === bundle.cpu,
                                )}
                              >
                                {CPUSlideMarkList.map((item, i) => (
                                  <SliderMark key={item.value} value={i} mt={3} fontSize={"sm"}>
                                    <Box
                                      className="-ml-[50px] w-[100px] text-center"
                                      cursor={"pointer "}
                                    >
                                      {item.label}
                                    </Box>
                                  </SliderMark>
                                ))}
                                <SliderTrack>
                                  <SliderFilledTrack bg="primary.500" />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                            </div>

                            <div className="mb-12">
                              <p className="mb-2">
                                <span className="mr-2 text-2xl font-semibold">RAM</span>
                                {formatLimitMemory(bundle.memory)}
                              </p>
                              <Slider
                                min={0}
                                max={MemorySlideMarkList.length - 1}
                                step={1}
                                onChange={(v) => {
                                  setBundle({
                                    ...bundle,
                                    memory: MemorySlideMarkList[v].value,
                                  });
                                }}
                                value={MemorySlideMarkList.findIndex(
                                  (item) => item.value === bundle.memory,
                                )}
                              >
                                {MemorySlideMarkList.map((item, i) => (
                                  <SliderMark key={item.value} value={i} mt={3} fontSize={"sm"}>
                                    <Box
                                      className="-ml-[50px] w-[100px] text-center"
                                      cursor={"pointer"}
                                    >
                                      {item.label}
                                    </Box>
                                  </SliderMark>
                                ))}
                                <SliderTrack>
                                  <SliderFilledTrack bg="primary.500" />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                            </div>

                            <div className="mb-12">
                              <p className="mb-2 ">
                                <span className="mr-2 text-2xl font-semibold">Storage</span>
                                {formatLimitCapacity(bundle.storageCapacity)}
                              </p>
                              <Slider
                                min={0}
                                max={StorageSlideMarkList.length - 1}
                                step={1}
                                onChange={(v) => {
                                  setBundle({
                                    ...bundle,
                                    storageCapacity: StorageSlideMarkList[v].value,
                                  });
                                }}
                                value={StorageSlideMarkList.findIndex(
                                  (item) => item.value === bundle.storageCapacity,
                                )}
                              >
                                {StorageSlideMarkList.map((item, i) => (
                                  <SliderMark key={item.value} value={i} mt={3} fontSize={"sm"}>
                                    <Box
                                      className="-ml-[50px] w-[100px] text-center"
                                      cursor={"pointer "}
                                    >
                                      {item.label}
                                    </Box>
                                  </SliderMark>
                                ))}
                                <SliderTrack>
                                  <SliderFilledTrack bg="primary.500" />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                            </div>

                            <div>
                              <p className="mb-2 text-lg font-semibold ">Traffic</p>
                              <p className="text-xl font-semibold">¥0.8 / G</p>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                    rules={{
                      required: { value: true, message: t("LimitSelect") },
                    }}
                  />
                </div>
                <FormErrorMessage>{errors?.bundleId?.message}</FormErrorMessage>
              </FormControl>

              {/* <FormControl isInvalid={!!errors?.runtimeId}>
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
              </FormControl> */}
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
                  // subscriptionControllerCreate.isLoading || subscriptionOptionRenew.isLoading
                  false
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
