import React, { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
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
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { debounce, find } from "lodash";

import ChargeButton from "@/components/ChargeButton";
// import ChargeButton from "@/components/ChargeButton";
import { APP_STATUS } from "@/constants/index";
import { formatPrice } from "@/utils/format";

import { APP_LIST_QUERY_KEY } from "../..";
import { queryKeys, useAccountQuery } from "../../service";

import BundleItem from "./BundleItem";

import { TApplicationItem, TBundle } from "@/apis/typing";
import { ApplicationControllerCreate, ApplicationControllerUpdate } from "@/apis/v1/applications";
import {
  ResourceControllerCalculatePrice,
  ResourceControllerGetResourceOptions,
} from "@/apis/v1/resources";
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

  const { data: billingResourceOptionsRes = {} } = useQuery(
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
    bundleId: string;
    runtimeId: string;
  };

  const currentRegion =
    regions.find((item: any) => item.id === application?.regionId) || regions[0];

  const bundles = currentRegion.bundles;

  let defaultValues = {
    name: application?.name,
    state: application?.state,
    regionId: application?.regionId,
    bundleId: application?.bundle?.bundleId,
    runtimeId: runtimes[0]._id,
  };

  if (type === "create") {
    defaultValues = {
      name: "",
      state: APP_STATUS.Running,
      regionId: regions[0]._id,
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
    getValues,
  } = useForm<FormData>({
    defaultValues,
  });

  const bundleId = useWatch({
    control,
    name: "bundleId",
  });

  const defaultBundle: TBundle =
    bundles.find((item: TBundle) => item._id === bundleId) || bundles[0];

  const [bundle, setBundle] = React.useState<{
    cpu: number;
    memory: number;
    databaseCapacity: number;
    storageCapacity: number;
  }>({
    cpu: defaultBundle.spec.cpu.value,
    memory: defaultBundle.spec.memory.value,
    databaseCapacity: defaultBundle.spec.databaseCapacity.value,
    storageCapacity: defaultBundle.spec.storageCapacity.value,
  });

  const { showSuccess } = useGlobalStore();

  const [totalPrice, setTotalPrice] = React.useState(0);

  const billingQuery = useQuery(
    [queryKeys.useBillingPriceQuery, bundle, isOpen],
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

  const debouncedInputChange = debounce((value) => {
    if (isOpen) {
      billingQuery.refetch();
    }
  }, 600);

  useEffect(() => {
    debouncedInputChange(bundle);
    return () => {
      debouncedInputChange.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle, isOpen]);

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdate(params));
  const createAppMutation = useMutation((params: any) => ApplicationControllerCreate(params));

  const onSubmit = async (data: any) => {
    let res: any = {};
    switch (type) {
      case "edit":
        res = await updateAppMutation.mutateAsync({ ...data, appid: application?.appid });
        break;

      case "create":
        res = await createAppMutation.mutateAsync({
          ...data,
          ...bundle,
          // duration: subscriptionOption.duration,
        });
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

  const activeBundle = find(bundles, {
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
                            {(bundles || []).map((item: TBundle) => {
                              return (
                                <BundleItem
                                  onChange={() => {
                                    onChange(item._id);
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
                            <BundleItem
                              onChange={onChange}
                              bundle={{
                                displayName: "Custom",
                                _id: "custom",
                              }}
                              isActive={!activeBundle}
                            />
                          </div>
                          <div className="ml-6 flex-1 border-l pl-12 pr-8">
                            {billingResourceOptionsRes.data?.map(
                              (item: {
                                type: "cpu" | "memory" | "databaseCapacity" | "storageCapacity";
                                specs: { value: number; price: number }[];
                                price: number;
                              }) => {
                                return (
                                  <div className="mb-12" key={item.type}>
                                    <p className="mb-2">
                                      <span className="mr-2 text-2xl font-semibold">
                                        {item.type}
                                      </span>
                                      {/* {item.price} */}
                                    </p>
                                    {/* {item.specs.map((spec: any, i: number) => (
                                      <Button
                                        onClick={(v) => {
                                          setBundle({
                                            ...bundle,
                                            [item.type]: spec.value,
                                          });
                                        }}
                                        size={"sm"}
                                        variant={
                                          spec.value === bundle[item.type] ? "solid" : "outline"
                                        }
                                        w="60px"
                                        rounded="sm"
                                      >
                                        {spec.label}
                                      </Button>
                                    ))} */}
                                    {item.specs.length > 0 ? (
                                      <Slider
                                        min={0}
                                        max={item.specs.length - 1}
                                        step={1}
                                        onChange={(v) => {
                                          setBundle({
                                            ...bundle,
                                            [item.type]: item.specs[v].value,
                                          });
                                        }}
                                        value={item.specs.findIndex(
                                          (spec: any) => spec.value === bundle[item.type],
                                        )}
                                      >
                                        {item.specs.map((spec: any, i: number) => (
                                          <SliderMark
                                            key={spec.value}
                                            value={i}
                                            mt={3}
                                            fontSize={"sm"}
                                          >
                                            <Box
                                              className="-ml-[50px] w-[100px] scale-90 text-center"
                                              cursor={"pointer "}
                                            >
                                              {spec.label}
                                            </Box>
                                          </SliderMark>
                                        ))}
                                        <SliderTrack>
                                          <SliderFilledTrack bg="primary.500" />
                                        </SliderTrack>
                                        <SliderThumb bg={"primary.700"} />
                                      </Slider>
                                    ) : (
                                      <span className="text-2xl font-semibold">{item.price}</span>
                                    )}
                                  </div>
                                );
                              },
                            )}
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
                {t("Fee")}:
                <span className="ml-2 text-xl font-semibold text-red-500">{totalPrice} / hour</span>
                <span className="ml-4 mr-2">
                  {t("Balance")}:
                  <span className="ml-2 text-xl">{formatPrice(accountQuery.data?.balance)}</span>
                </span>
                {totalPrice > accountQuery.data?.balance ? (
                  <span className="mr-2">{t("balance is insufficient")}</span>
                ) : null}
                <ChargeButton>
                  <span className="cursor-pointer text-blue-800">{t("ChargeNow")}</span>
                </ChargeButton>
              </div>
            )}

            {type !== "edit" && totalPrice <= accountQuery.data?.balance && (
              <Button
                isLoading={createAppMutation.isLoading}
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
