import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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

const CreateAppModal = (props: {
  type: "create" | "edit" | "change";
  application?: TApplicationItem;
  children: React.ReactElement;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application, type } = props;

  const title = type === "edit" ? t("Edit") : type === "change" ? t("Change") : t("Create");

  const { runtimes = [], regions = [] } = useGlobalStore();

  const { data: accountRes } = useAccountQuery();

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
    cpu: number;
    memory: number;
    databaseCapacity: number;
    storageCapacity: number;
  };

  const currentRegion =
    regions.find((item: any) => item._id === application?.regionId) || regions[0];

  const bundles = currentRegion.bundles;

  let defaultValues = {
    name: application?.name,
    state: application?.state,
    regionId: application?.regionId,
    runtimeId: runtimes[0]._id,
    bundleId: bundles[0]._id,
  };

  if (type === "create") {
    defaultValues = {
      name: "",
      state: APP_STATUS.Running,
      regionId: regions[0]._id,
      runtimeId: runtimes[0]._id,
      bundleId: bundles[0]._id,
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
    cpu: application?.bundle.resource.limitCPU || bundles[0].spec.cpu.value,
    memory: application?.bundle.resource.limitMemory || bundles[0].spec.memory.value,
    databaseCapacity:
      application?.bundle.resource.databaseCapacity || bundles[0].spec.databaseCapacity.value,
    storageCapacity:
      application?.bundle.resource.storageCapacity || bundles[0].spec.storageCapacity.value,
  };

  const [bundle, setBundle] = React.useState(defaultBundle);

  const [customActive, setCustomActive] = React.useState(false);

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

  const debouncedInputChange = debounce(() => {
    if (isOpen) {
      billingQuery.refetch();
    }
  }, 600);

  useEffect(() => {
    debouncedInputChange();
    return () => {
      debouncedInputChange.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle, isOpen]);

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdateName(params));
  const createAppMutation = useMutation((params: any) => ApplicationControllerCreate(params));
  const changeBundleMutation = useMutation((params: any) =>
    ApplicationControllerUpdateBundle(params),
  );

  const onSubmit = async (data: FormData) => {
    let res: any = {};

    switch (type) {
      case "edit":
        res = await updateAppMutation.mutateAsync({ name: data.name, appid: application?.appid });
        break;

      case "change":
        res = await changeBundleMutation.mutateAsync({ ...bundle, appid: application?.appid });
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
      if (type !== "create") {
        showSuccess(t("update success"));
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
      {isOpen && !isLoading ? (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent maxW={"80%"} width={"auto"} minW={"500px"} m={"auto"}>
            <ModalHeader>{title}</ModalHeader>
            <ModalCloseButton />

            <ModalBody pb={6}>
              <VStack spacing={6} align="flex-start">
                <FormControl
                  isRequired
                  isInvalid={!!errors?.name}
                  isDisabled={type === "change"}
                  hidden={type === "change"}
                >
                  <FormLabel htmlFor="name">{t("HomePanel.Application") + t("Name")}</FormLabel>
                  <Input
                    {...register("name", {
                      required: `${t("HomePanel.Application")} ${t("IsRequired")}`,
                    })}
                  />
                  <FormErrorMessage>{errors?.name && errors?.name?.message}</FormErrorMessage>
                </FormControl>
                <FormControl hidden={type !== "create"}>
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
                <FormControl hidden={type === "edit"}>
                  <FormLabel htmlFor="bundleId">{t("HomePanel.Spec")}</FormLabel>
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
                                      // billingPriceQuery.refetch();
                                      setCustomActive(false);
                                      setBundle({
                                        cpu: item.spec.cpu.value,
                                        memory: item.spec.memory.value,
                                        databaseCapacity: item.spec.databaseCapacity.value,
                                        storageCapacity: item.spec.storageCapacity.value,
                                      });
                                    }}
                                    bundle={item}
                                    isActive={activeBundle?._id === item._id && !customActive}
                                    key={item._id}
                                  />
                                );
                              })}
                              <BundleItem
                                onChange={() => {
                                  setCustomActive(true);
                                }}
                                bundle={{
                                  displayName: t("custom"),
                                  _id: "custom",
                                }}
                                isActive={!activeBundle || customActive}
                              />
                            </div>
                            <div className="ml-6 flex-1 border-l pl-6 pr-2">
                              {billingResourceOptionsRes?.data?.map(
                                (item: {
                                  type: "cpu" | "memory" | "databaseCapacity" | "storageCapacity";
                                  specs: { value: number; price: number }[];
                                  price: number;
                                }) => {
                                  return item.specs.length > 0 ? (
                                    <div className="mb-8" key={item.type}>
                                      <p className="mb-2">
                                        <span className="mr-2 text-lg font-semibold  ">
                                          {t(`SpecItem.${item.type}`)}
                                        </span>
                                        {/* {item.price} */}
                                      </p>
                                      {item.specs.map((spec: any, i: number) => (
                                        <Button
                                          key={`${item.type}-${i}`}
                                          onClick={(v) => {
                                            setBundle({
                                              ...bundle,
                                              [item.type]: spec.value,
                                            });
                                          }}
                                          size={"sm"}
                                          variant={
                                            spec.value === bundle[item.type] ? "thirdly" : "outline"
                                          }
                                          minW={"64px"}
                                          mr={1}
                                          mb={1}
                                          rounded="sm"
                                        >
                                          {spec.label}
                                        </Button>
                                      ))}
                                    </div>
                                  ) : null;
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
                  {totalPrice <= 0 ? (
                    <span className="ml-2 text-xl font-semibold text-red-500">
                      {t("Price.Free")}
                    </span>
                  ) : (
                    <span className="ml-2 text-xl font-semibold text-red-500">
                      {totalPrice} / hour
                    </span>
                  )}
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
