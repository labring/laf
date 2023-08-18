import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormErrorMessage,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { debounce } from "lodash";

import ChargeButton from "@/components/ChargeButton";
import { APP_STATUS } from "@/constants/index";
import { formatPrice } from "@/utils/format";

import { APP_LIST_QUERY_KEY } from "../..";
import { queryKeys, useAccountQuery } from "../../service";

import AutoscalingControl, { TypeAutoscaling } from "./AutoscalingControl";
import BundleControl, { TypeBundle } from "./BundleControl";

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

const CreateAppModal = (props: {
  type: "create" | "edit" | "change";
  application?: TApplicationItem;
  children: React.ReactElement;
  isCurrentApp?: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application, type, isCurrentApp } = props;

  const title = type === "edit" ? t("Edit") : type === "change" ? t("Change") : t("CreateApp");

  const { runtimes = [], regions = [] } = useGlobalStore();

  const { data: accountRes } = useAccountQuery();

  const currentRegion =
    regions.find((item: any) => item._id === application?.regionId) || regions[0];

  const bundles = currentRegion.bundles;
  const sortedBundles = [...bundles].sort(
    (a: TBundle, b: TBundle) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  type FormData = {
    name: string;
    state: APP_STATUS | string;
    regionId: string;
    runtimeId: string;
    bundleId: string;
  };

  let defaultValues = {
    name: application?.name || "",
    state: application?.state || APP_STATUS.Running,
    regionId: application?.regionId || regions[0]._id,
    runtimeId: runtimes[0]._id,
    bundleId: sortedBundles[0]._id,
  };

  const {
    register,
    handleSubmit,
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

  const { showSuccess, currentApp, setCurrentApp } = useGlobalStore();

  const [totalPrice, setTotalPrice] = React.useState(0);
  const [calculating, setCalculating] = React.useState(false);

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
        setCalculating(false);
      },
    },
  );

  const { data: billingResourceOptionsRes, isLoading } = useQuery(
    queryKeys.useBillingResourceOptionsQuery,
    async () => {
      return ResourceControllerGetResourceOptions({});
    },
    {
      enabled: isOpen,
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

        if (isCurrentApp) {
          const newResource = {
            ...currentApp.bundle.resource,
            limitCPU: bundle.cpu,
            limitMemory: bundle.memory,
            databaseCapacity: bundle.databaseCapacity,
            storageCapacity: bundle.storageCapacity,
          };

          const newBundle = {
            ...currentApp.bundle,
            resource: newResource,
            autoscaling: autoscaling,
          };
          setCurrentApp({ ...currentApp, bundle: newBundle });
        }
        break;

      case "create":
        res = await createAppMutation.mutateAsync({
          ...data,
          ...bundle,
          autoscaling,
        });
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
                {type !== "edit" && (
                  <>
                    <BundleControl
                      bundle={bundle}
                      setBundle={setBundle}
                      sortedBundles={sortedBundles}
                      billingResourceOptionsRes={billingResourceOptionsRes}
                      setCalculating={setCalculating}
                    />
                    <AutoscalingControl autoscaling={autoscaling} setAutoscaling={setAutoscaling} />
                  </>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter h={20}>
              {type !== "edit" && (
                <div className="flex items-center">
                  {t("Fee")}:
                  {!calculating ? (
                    <span className="ml-2 w-32 text-center text-xl font-semibold text-red-500">
                      {totalPrice} / hour
                    </span>
                  ) : (
                    <span className="ml-2 flex w-32 justify-center">
                      <Spinner className="!h-4 !w-4" />
                    </span>
                  )}
                </div>
              )}
              <div className="mr-2 flex items-center">
                <span className="ml-4 mr-2">
                  {t("Balance") + ":"}
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
