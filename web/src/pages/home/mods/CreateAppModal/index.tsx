import React, { useState } from "react";
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

// import ChargeButton from "@/components/ChargeButton";
import { APP_STATUS } from "@/constants/index";

import BundleItem from "./BundleItem";
import RuntimeItem from "./RuntimeItem";

import { TBundle } from "@/apis/typing";
import {
  ApplicationControllerCreate,
  ApplicationControllerRemove,
  ApplicationControllerUpdate,
} from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

const CreateAppModal = (props: {
  application?: any;
  isDelete?: boolean;
  setShouldRefetch?: any;
  children: React.ReactElement;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application = {}, isDelete = false, setShouldRefetch = () => {} } = props;
  const isEdit = !!application.name;
  // input APPID by user
  const [inputAppId, setInputAppId] = useState<string>("");

  const handleInputAppIdChange = (event: any) => {
    setInputAppId(event.target.value);
  };

  // if is delete, reset input when close modal
  const onCustomClose = () => {
    isDelete && setInputAppId("");
    onClose();
  };

  const { runtimes = [], regions = [] } = useGlobalStore();

  type FormData = {
    name: string;
    state: APP_STATUS;
    regionId: string;
    bundleId: string;
    runtimeId: string;
    duration: string;
  };

  const bundles = regions[0].bundles;

  const defaultValues = {
    name: application.name,
    state: application.state || APP_STATUS.Running,
    regionId: application.regionId || regions[0].id,
    bundleId: application.bundleId || bundles[0].id,
    duration: "1",
    runtimeId: runtimes[0].id,
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

  const bundleId = useWatch({
    control,
    name: "bundleId", // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
  });

  const { showSuccess, showError } = useGlobalStore();

  const appCreateMutation = useMutation((params: any) => ApplicationControllerCreate(params));

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdate(params));

  const deleteAppMutation = useMutation((params: any) => ApplicationControllerRemove(params), {
    onSuccess: () => {
      onCustomClose();
      setShouldRefetch(true);
    },
    onError: () => {},
  });

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isDelete) {
      deleteAppMutation.mutate({ appid: application.appid });
      return;
    } else if (isEdit) {
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

  const currentBundle = bundles.find((item: TBundle) => item.id === bundleId) || bundles[0];
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

      <Modal isOpen={isOpen} onClose={onCustomClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isDelete ? t("Delete") : isEdit ? t("Edit") : t("Create")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">
                  {isDelete
                    ? t("InputTip") + " APP ID " + t("Confirm")
                    : t("HomePanel.Application") + t("Name")}
                </FormLabel>
                {isDelete ? (
                  <Input
                    value={inputAppId}
                    {...register("name")}
                    onChange={handleInputAppIdChange}
                  />
                ) : (
                  <Input
                    {...register("name", {
                      required: `${t("HomePanel.Application")} ${t("IsRequired")}`,
                    })}
                  />
                )}

                <FormErrorMessage>{errors?.name && errors?.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired hidden={isEdit || isDelete}>
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

              <FormControl isRequired isInvalid={!!errors?.bundleId} hidden={isEdit || isDelete}>
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

              {currentBundle.price > 0 ? (
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

              <FormControl isRequired isInvalid={!!errors?.runtimeId} hidden={isDelete}>
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
            {/* {bundleName === "standard" ? (
              <div className="mr-2">
                <span className="ml-6 text-red-500 font-semibold text-xl">{t("Price.Free")}</span>
              </div>
            ) : (
              <div className="mr-2">
                账户余额: ¥ 0
                <ChargeButton>
                  <span>立即充值</span>
                </ChargeButton>
                <span className="ml-6 text-red-500 font-semibold text-xl">{totalPrice}</span>
              </div>
            )} */}
            <Button
              isLoading={appCreateMutation.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
              isDisabled={totalPrice > 0 || (isDelete && inputAppId !== application.appid)}
            >
              {isEdit || isDelete ? t("Confirm") : t("CreateNow")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
