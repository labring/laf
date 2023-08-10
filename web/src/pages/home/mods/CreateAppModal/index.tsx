import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderMark,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Switch,
  Tooltip,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { t } from "i18next";
import { debounce, find } from "lodash";

import ChargeButton from "@/components/ChargeButton";
import { AutoScalingIcon, RecommendIcon, TextIcon } from "@/components/CommonIcon";
import { APP_STATUS } from "@/constants/index";
import { formatPrice } from "@/utils/format";

import { APP_LIST_QUERY_KEY } from "../..";
import { queryKeys, useAccountQuery } from "../../service";

import BundleItem from "./BundleItem";

import { TApplicationItem, TBundle } from "@/apis/typing";
import {
  ApplicationControllerCreate,
  ApplicationControllerUpdateBundle,
  ApplicationControllerUpdateName,
} from "@/apis/v1/applications";
import {
  ResourceControllerCalculatePrice,
  ResourceControllerGetResourceOptions,
} from "@/apis/v1/resources";
import useGlobalStore from "@/pages/globalStore";

type TypeBundle = {
  cpu: number;
  memory: number;
  databaseCapacity: number;
  storageCapacity: number;
};

type TypeAutoscaling = {
  enable: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetCPUUtilizationPercentage: number | null;
  targetMemoryUtilizationPercentage: number | null;
};

const CreateAppModal = (props: {
  type: "create" | "edit" | "change";
  application?: TApplicationItem;
  children: React.ReactElement;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application, type } = props;

  const title = type === "edit" ? t("Edit") : type === "change" ? t("Change") : t("CreateApp");

  const { runtimes = [], regions = [] } = useGlobalStore();

  const { data: accountRes } = useAccountQuery();

  const darkMode = useColorMode().colorMode === "dark";

  const { data: billingResourceOptionsRes, isLoading } = useQuery(
    queryKeys.useBillingResourceOptionsQuery,
    async () => {
      return ResourceControllerGetResourceOptions({});
    },
    {
      enabled: isOpen,
    },
  );

  type FormData = {
    name: string;
    state: APP_STATUS | string;
    regionId: string;
    runtimeId: string;
    bundleId: string;
  };

  const currentRegion =
    regions.find((item: any) => item._id === application?.regionId) || regions[0];

  const bundles = currentRegion.bundles;
  const sortedBundles = [...bundles].sort(
    (a: TBundle, b: TBundle) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let defaultValues = {
    name: application?.name,
    state: application?.state,
    regionId: application?.regionId,
    runtimeId: runtimes[0]._id,
    bundleId: sortedBundles[0]._id,
  };

  if (type === "create") {
    defaultValues = {
      name: "",
      state: APP_STATUS.Running,
      regionId: regions[0]._id,
      runtimeId: runtimes[0]._id,
      bundleId: sortedBundles[0]._id,
    };
  }

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues,
  });

  const defaultBundle: TypeBundle = {
    cpu: application?.bundle.resource.limitCPU || sortedBundles[0].spec.cpu.value,
    memory: application?.bundle.resource.limitMemory || sortedBundles[0].spec.memory.value,
    databaseCapacity:
      application?.bundle.resource.databaseCapacity || sortedBundles[0].spec.databaseCapacity.value,
    storageCapacity:
      application?.bundle.resource.storageCapacity || sortedBundles[0].spec.storageCapacity.value,
  };

  const defaultAutoscaling: TypeAutoscaling = {
    enable: application?.bundle.autoscaling?.enable || false,
    minReplicas: application?.bundle.autoscaling?.minReplicas || 1,
    maxReplicas: application?.bundle.autoscaling?.maxReplicas || 5,
    targetCPUUtilizationPercentage:
      application?.bundle.autoscaling?.targetCPUUtilizationPercentage || null,
    targetMemoryUtilizationPercentage:
      application?.bundle.autoscaling?.targetMemoryUtilizationPercentage || null,
  };

  const [bundle, setBundle] = React.useState(defaultBundle);

  const [autoscaling, setAutoscaling] = React.useState(defaultAutoscaling);

  const { showSuccess } = useGlobalStore();

  const [totalPrice, setTotalPrice] = React.useState(0);

  const billingQuery = useQuery(
    [queryKeys.useBillingPriceQuery],
    async () => {
      return ResourceControllerCalculatePrice({
        ...getValues(),
        ...bundle,
      });
    },
    {
      enabled: false,
      staleTime: 1000,
      onSuccess(res) {
        setTotalPrice(res?.data?.total || 0);
      },
    },
  );

  useEffect(() => {
    const debouncedBillingQuery = debounce(() => {
      billingQuery.refetch();
    }, 500);

    if (isOpen) {
      debouncedBillingQuery();
    }

    return () => {
      debouncedBillingQuery.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bundle, autoscaling]);

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdateName(params));
  const createAppMutation = useMutation((params: any) => ApplicationControllerCreate(params));
  const changeBundleMutation = useMutation((params: any) =>
    ApplicationControllerUpdateBundle(params),
  );

  const onSubmit = async (data: FormData) => {
    let res: any = {};

    switch (type) {
      case "edit":
        res = await updateAppMutation.mutateAsync({
          name: data.name,
          appid: application?.appid,
        });
        break;

      case "change":
        res = await changeBundleMutation.mutateAsync({
          ...bundle,
          appid: application?.appid,
          autoscaling,
        });
        break;

      case "create":
        if (
          !autoscaling.targetCPUUtilizationPercentage &&
          !autoscaling.targetMemoryUtilizationPercentage &&
          autoscaling.enable
        ) {
          res = await createAppMutation.mutateAsync({
            ...data,
            ...bundle,
            autoscaling: {
              ...autoscaling,
              targetCPUUtilizationPercentage: 50,
            },
          });
        } else {
          res = await createAppMutation.mutateAsync({
            ...data,
            ...bundle,
            autoscaling,
            // duration: subscriptionOption.duration,
          });
        }
        break;

      default:
        break;
    }

    if (!res.error) {
      onClose();
      if (type !== "create") {
        showSuccess(t("update success"));
      } else {
        showSuccess(t("create success"));
      }

      // Run every 2 seconds, 2 times in total
      queryClient.invalidateQueries(APP_LIST_QUERY_KEY);
      const interval = setInterval(() => {
        queryClient.invalidateQueries(APP_LIST_QUERY_KEY);
      }, 2000);
      setTimeout(() => {
        clearInterval(interval);
      }, 4000);
    }
  };

  const activeBundle = find(sortedBundles, {
    spec: {
      cpu: {
        value: bundle.cpu,
      },
      memory: {
        value: bundle.memory,
      },
      databaseCapacity: {
        value: bundle.databaseCapacity,
      },
      storageCapacity: {
        value: bundle.storageCapacity,
      },
    },
  });

  return (
    <>
      {React.cloneElement(props.children, {
        onClick: (event?: any) => {
          event?.preventDefault();
          reset(defaultValues);
          setBundle(defaultBundle);
          setAutoscaling(defaultAutoscaling);
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        },
      })}
      {isOpen && !isLoading ? (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent maxW={"80%"} width={"auto"} minW={"700px"} m={"auto"}>
            <ModalHeader>{title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="flex-start">
                <FormControl
                  isRequired
                  isInvalid={!!errors?.name}
                  isDisabled={type === "change"}
                  hidden={type === "change"}
                >
                  <div className="mb-3 flex h-12 w-full items-center border-b-2">
                    <input
                      {...register("name", {
                        required: `${t("HomePanel.Application") + t("Name") + t("IsRequired")}`,
                      })}
                      id="name"
                      placeholder={String(t("HomePanel.Application") + t("Name"))}
                      className="h-8 w-10/12 border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
                      style={{ outline: "none", boxShadow: "none" }}
                    />
                  </div>
                  <FormErrorMessage>{errors?.name && errors?.name?.message}</FormErrorMessage>
                </FormControl>
                {/* <FormControl hidden={type !== "create"}>
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
                </FormControl> */}
                <FormControl hidden={type === "edit"}>
                  <Controller
                    name="bundleId"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <div className="flex">
                          <div className="flex-1 rounded-md border">
                            <div
                              className={clsx(
                                "flex items-center justify-between px-8 py-3.5",
                                darkMode ? "" : "bg-[#F6F8F9]",
                              )}
                            >
                              <div className="flex items-center">
                                <TextIcon
                                  boxSize={3}
                                  mr={2}
                                  color={darkMode ? "" : "grayModern.600"}
                                />
                                <span className="text-lg font-semibold">
                                  {t("application.ChooseSpecifications")}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <RecommendIcon boxSize={4} mr={2} color={"primary.600"} />
                                <span className="">
                                  {t("application.RecommendedSpecifications")}
                                </span>
                                {(sortedBundles || []).map((item: TBundle) => {
                                  return (
                                    <BundleItem
                                      onChange={() => {
                                        // billingPriceQuery.refetch();
                                        setBundle({
                                          cpu: item.spec.cpu.value,
                                          memory: item.spec.memory.value,
                                          databaseCapacity: item.spec.databaseCapacity.value,
                                          storageCapacity: item.spec.storageCapacity.value,
                                        });
                                      }}
                                      bundle={item}
                                      isActive={activeBundle?._id === item._id}
                                      key={item._id}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                            <div className="pb-8">
                              {billingResourceOptionsRes?.data?.map(
                                (item: {
                                  type: "cpu" | "memory" | "databaseCapacity" | "storageCapacity";
                                  specs: { value: number; price: number }[];
                                  price: number;
                                }) => {
                                  return item.specs.length > 0 ? (
                                    <div className="ml-8 mt-8 flex" key={item.type}>
                                      <span
                                        className={clsx(
                                          "w-2/12",
                                          darkMode ? "" : "text-grayModern-600",
                                        )}
                                      >
                                        {t(`SpecItem.${item.type}`)}
                                      </span>
                                      <Slider
                                        id="slider"
                                        className="mr-12"
                                        value={item.specs.findIndex(
                                          (spec) => spec.value === bundle[item.type],
                                        )}
                                        min={0}
                                        max={item.specs.length - 1}
                                        colorScheme="primary"
                                        onChange={(v) => {
                                          setBundle({
                                            ...bundle,
                                            [item.type]: item.specs[v].value,
                                          });
                                        }}
                                      >
                                        {item.specs.map((spec: any, i: number) => (
                                          <SliderMark
                                            key={spec.value}
                                            value={i}
                                            className={clsx(
                                              "mt-2 whitespace-nowrap",
                                              darkMode ? "" : "text-grayModern-600",
                                            )}
                                            ml={"-3"}
                                          >
                                            {spec.label}
                                          </SliderMark>
                                        ))}

                                        <SliderTrack>
                                          <SliderFilledTrack bg={"primary.200"} />
                                        </SliderTrack>
                                        <SliderThumb bg={"primary.500"} />
                                      </Slider>
                                    </div>
                                  ) : null;
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }}
                    rules={{
                      required: { value: true, message: t("LimitSelect") },
                    }}
                  />
                  <FormErrorMessage>{errors?.bundleId?.message}</FormErrorMessage>
                </FormControl>

                <FormControl hidden={type === "edit"}>
                  <div className="rounded-md border">
                    <div
                      className={clsx(
                        "flex justify-between px-8 py-3.5",
                        darkMode ? "" : "bg-[#F6F8F9]",
                      )}
                    >
                      <div className="flex items-center">
                        <AutoScalingIcon
                          mr={2}
                          boxSize={3}
                          color={darkMode ? "" : "grayModern.600"}
                        />
                        <span className="text-lg font-semibold">
                          {t("application.autoscaling")}
                        </span>
                      </div>
                      <Switch
                        id="email-alerts"
                        defaultChecked={defaultAutoscaling.enable}
                        colorScheme="primary"
                        onChange={() => {
                          if (autoscaling.enable) {
                            setAutoscaling({
                              ...autoscaling,
                              enable: !autoscaling.enable,
                            });
                          } else {
                            setAutoscaling({
                              ...autoscaling,
                              enable: !autoscaling.enable,
                              targetCPUUtilizationPercentage: 50,
                              targetMemoryUtilizationPercentage: null,
                            });
                          }
                        }}
                      />
                    </div>
                    {autoscaling.enable && (
                      <div>
                        <div className="flex px-8 pt-8">
                          <span className={clsx("w-2/12", darkMode ? "" : "text-grayModern-600")}>
                            {t("application.Number of Instances")}
                          </span>
                          <RangeSlider
                            defaultValue={[
                              defaultAutoscaling.minReplicas,
                              defaultAutoscaling.maxReplicas,
                            ]}
                            min={1}
                            max={20}
                            colorScheme="primary"
                            onChange={(v) => {
                              setAutoscaling({
                                ...autoscaling,
                                minReplicas: v[0],
                                maxReplicas: v[1],
                              });
                            }}
                          >
                            {[1, 10, 20].map((value) => (
                              <RangeSliderMark
                                value={value}
                                className={clsx(
                                  "mt-2 whitespace-nowrap",
                                  darkMode ? "" : "text-grayModern-600",
                                )}
                                ml={"-1.5"}
                                key={value}
                              >
                                {value}
                              </RangeSliderMark>
                            ))}
                            <RangeSliderTrack>
                              <RangeSliderFilledTrack bg={"primary.200"} />
                            </RangeSliderTrack>
                            <Tooltip
                              hasArrow
                              label={String(autoscaling.minReplicas)}
                              placement="top"
                              bg={"primary.500"}
                            >
                              <RangeSliderThumb bg={"primary.500"} index={0} />
                            </Tooltip>
                            <Tooltip
                              hasArrow
                              label={String(autoscaling.maxReplicas)}
                              placement="top"
                              bg={"primary.500"}
                            >
                              <RangeSliderThumb bg={"primary.500"} index={1} />
                            </Tooltip>
                          </RangeSlider>
                        </div>
                        <div className="flex items-center pb-8 pt-6">
                          <div className="ml-8 mr-4 flex w-24">
                            <Select
                              onChange={(e) => {
                                if (e.target.value === t("Storage Threshold")) {
                                  setAutoscaling({
                                    ...autoscaling,
                                    targetCPUUtilizationPercentage: null,
                                    targetMemoryUtilizationPercentage: 50,
                                  });
                                } else {
                                  setAutoscaling({
                                    ...autoscaling,
                                    targetCPUUtilizationPercentage: 50,
                                    targetMemoryUtilizationPercentage: null,
                                  });
                                }
                              }}
                              defaultValue={
                                defaultAutoscaling.targetCPUUtilizationPercentage !== null ||
                                (defaultAutoscaling.targetMemoryUtilizationPercentage === null &&
                                  defaultAutoscaling.targetCPUUtilizationPercentage === null)
                                  ? String(t("application.CPU Threshold"))
                                  : String(t("Storage Threshold"))
                              }
                              className={clsx(
                                "!h-8 !border-none !px-2 !text-[12px]",
                                darkMode ? "" : "!bg-[#F4F6F8]",
                              )}
                            >
                              <option className="">{t("application.CPU Threshold")}</option>
                              <option>{t("Storage Threshold")}</option>
                            </Select>
                          </div>
                          <Input
                            value={
                              autoscaling.targetCPUUtilizationPercentage
                                ? (autoscaling.targetCPUUtilizationPercentage as number)
                                : (autoscaling.targetMemoryUtilizationPercentage as number) || 50
                            }
                            className="!h-8 !w-20"
                            onChange={(e) => {
                              if (autoscaling.targetCPUUtilizationPercentage) {
                                setAutoscaling({
                                  ...autoscaling,
                                  targetCPUUtilizationPercentage: Number(e.target.value),
                                  targetMemoryUtilizationPercentage: null,
                                });
                              } else {
                                setAutoscaling({
                                  ...autoscaling,
                                  targetCPUUtilizationPercentage: null,
                                  targetMemoryUtilizationPercentage: Number(e.target.value),
                                });
                              }
                            }}
                          />
                          <span className="pl-2">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                {activeBundle?.message && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: activeBundle?.message,
                    }}
                  ></div>
                )}

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
              {type === "edit" || isLoading ? null : (
                <div className="flex items-center">
                  {t("Fee")}:
                  <span className="ml-2 text-xl font-semibold text-red-500">
                    {totalPrice} / hour
                  </span>
                </div>
              )}
              <div className="mr-2 flex items-center">
                <span className="ml-4 mr-2">
                  {t("Balance")}:
                  <span className="ml-2 text-xl">{formatPrice(accountRes?.data?.balance)}</span>
                </span>
                {totalPrice > accountRes?.data?.balance! ? (
                  <span className="mr-2">{t("balance is insufficient")}</span>
                ) : null}
                <ChargeButton>
                  <span className="cursor-pointer text-blue-800">{t("ChargeNow")}</span>
                </ChargeButton>
              </div>
              {type !== "edit" && totalPrice <= accountRes?.data?.balance! && (
                <Button
                  isLoading={createAppMutation.isLoading}
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={totalPrice > 0}
                >
                  {type === "change" ? t("Confirm") : t("CreateNow")}
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
      ) : null}
    </>
  );
};

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
