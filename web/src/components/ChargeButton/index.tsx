import React, { useRef } from "react";
import {
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { t } from "i18next";
import isNumber from "lodash/isNumber";
import { QRCodeSVG } from "qrcode.react";

import { CHARGE_CHANNEL, CURRENCY } from "@/constants";
import { convertMoney, formatPrice } from "@/utils/format";

import {
  AccountControllerCharge,
  AccountControllerGetChargeOrder,
  AccountControllerGetChargeRewardList,
} from "@/apis/v1/accounts";
import { useAccountQuery } from "@/pages/home/service";

export default function ChargeButton(props: { amount?: number; children: React.ReactElement }) {
  const { children } = props;
  const darkMode = useColorMode().colorMode === "dark";
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [amount, setAmount] = React.useState<number>(0);
  const [bonus, setBonus] = React.useState<[{ amount: number; reward: number }]>();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phaseStatus, setPhaseStatus] = React.useState<string | undefined>();

  const { data: createOrderRes, ...createChargeOrder } = useMutation(
    ["AccountControllerCharge"],
    (params: any) => AccountControllerCharge(params),
    {},
  );

  const { data: accountRes, refetch: accountRefetch } = useAccountQuery();

  useQuery(
    ["AccountControllerGetChargeOrder"],
    () =>
      AccountControllerGetChargeOrder({
        id: createOrderRes?.data?.order?._id,
      }),
    {
      enabled: !!createOrderRes?.data?.order?._id && isOpen,
      refetchInterval: phaseStatus === "Pending" && isOpen ? 1000 : false,
      onSuccess: (res) => {
        setPhaseStatus(res?.data?.phase);
        if (res?.data?.phase === "Paid" && phaseStatus !== "Paid") {
          accountRefetch();
          onClose();
          setPhaseStatus(res?.data?.phase);
        }
      },
    },
  );

  useQuery(
    ["AccountControllerGetChargeRewardList"],
    () => AccountControllerGetChargeRewardList({}),
    {
      enabled: isOpen,
      onSuccess: (res) => {
        setBonus(res.data);
      },
    },
  );

  const matchBonus = (amount: number) => {
    const index = (bonus || []).findIndex((item) => item.amount > amount);
    const matchedItem = index === -1 ? bonus?.[bonus?.length - 1] : bonus?.[index - 1];
    return matchedItem?.reward && matchedItem?.reward / 100;
  };

  return (
    <>
      {React.cloneElement(children, { onClick: onOpen })}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent marginTop={20} maxW={"500px"}>
          <ModalHeader>{t("Charge")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="10">
            <div className="flex flex-col text-lg">
              <div className="flex items-center pb-6">
                <span className="mr-6 text-second">{t("Balance")}</span>
                <span className="text-[24px] font-semibold">
                  {formatPrice(accountRes?.data?.balance)}
                </span>
              </div>
              {bonus && <p className="mb-4 text-second">{t("Recharge amount")}</p>}
              <div className="mb-5 grid grid-cols-3 gap-4">
                {(bonus || []).map((item) => (
                  <div className="relative" key={item.amount}>
                    {item.reward !== 0 && (
                      <span className="absolute left-20 top-1 z-50 whitespace-nowrap rounded-full rounded-bl-none bg-purple-200 px-4 py-[1.5px] text-[12px] text-purple-600">
                        {t("application.bonus")} ¥{item.reward / 100}
                      </span>
                    )}
                    <Button
                      className={clsx(
                        "w-full !rounded-md !border-2 py-10 !text-[24px]",
                        item.amount === amount * 100
                          ? "!border-primary-400 !text-primary-600"
                          : "!border-transparent",
                        darkMode ? "bg-gray-500" : "bg-gray-100 ",
                      )}
                      variant={"outline"}
                      key={item.amount}
                      onClick={() => {
                        setAmount(item.amount / 100);
                      }}
                    >
                      ¥{item.amount / 100}
                    </Button>
                  </div>
                ))}
              </div>
              <InputGroup className="flex items-center pb-5">
                <div className="w-20 text-lg text-second">{t("application.Recharge")}</div>
                <InputLeftAddon
                  style={{ backgroundColor: darkMode ? "#252934" : "#FAFBFB" }}
                  className="!px-0 !pl-3"
                  children="¥"
                />
                <Input
                  ref={inputRef}
                  disabled
                  className={clsx("!w-5/12 !border-none !px-2", darkMode ? "" : "!bg-gray-100")}
                  value={amount}
                  onInput={(event) => {
                    const value = Number(event.currentTarget.value);
                    if (isNumber(value) && !isNaN(value)) {
                      setAmount(value);
                    } else {
                      if (inputRef.current) inputRef.current.value = String(amount);
                    }
                  }}
                />
                {bonus && matchBonus(amount * 100) && (
                  <div>
                    <span className="ml-3 whitespace-nowrap rounded-full rounded-bl-none bg-purple-200 px-2 py-[1.5px] text-[12px] text-purple-600">
                      {t("application.bonus")}
                    </span>
                    <span className="pl-1 font-semibold">¥{matchBonus(amount * 100) || 0}</span>
                  </div>
                )}
              </InputGroup>
              <Button
                isDisabled={!amount || !isNumber(amount)}
                className="!h-9 w-full !rounded-full"
                isLoading={createChargeOrder.isLoading}
                onClick={() => {
                  createChargeOrder.mutateAsync({
                    amount: convertMoney(amount || 0),
                    channel: CHARGE_CHANNEL.WeChat,
                    currency: CURRENCY.CNY,
                  });
                }}
              >
                {t("Confirm")}
              </Button>
            </div>

            {createOrderRes?.data?.result?.code_url && phaseStatus !== "Paid" && (
              <div className="mt-4 flex flex-col items-center text-xl ">
                <h2 className="mb-2">{t("Scan with WeChat")}</h2>
                <QRCodeSVG
                  value={createOrderRes?.data?.result?.code_url}
                  width={180}
                  height={180}
                />
                <p className="mt-4 text-base text-second ">
                  {t("Order Number")}：{createOrderRes?.data?.order?._id}
                </p>
                <p className="mt-1 text-base text-second ">
                  {t("payment status")}: {phaseStatus}
                </p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
