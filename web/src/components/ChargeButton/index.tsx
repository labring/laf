import React from "react";
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
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { QRCodeSVG } from "qrcode.react";

import { CHARGE_CHANNEL, CURRENCY } from "@/constants";
import { convertMoney, formatPrice } from "@/utils/format";

import { AccountControllerCharge, AccountControllerGetChargeOrder } from "@/apis/v1/accounts";
import { useAccountQuery } from "@/pages/home/service";

export default function ChargeButton(props: { amount?: number; children: React.ReactElement }) {
  const { children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [amount, setAmount] = React.useState<number>();

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
        if (res?.data?.phase === "Paid") {
          accountRefetch();
          onClose();
        }
      },
    },
  );

  return (
    <>
      {React.cloneElement(children, { onClick: onOpen })}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent marginTop={40} maxW={"390px"}>
          <ModalHeader>{t("Charge")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody px="10" pb="10">
            <div className="flex flex-col items-center text-xl">
              <h2 className="text-second">{t("Balance")}</h2>
              <h3 className="mb-4 text-3xl font-semibold">
                {formatPrice(accountRes?.data?.balance)}
              </h3>
              <p className="mb-2 text-second">{t("Recharge amount")}</p>
              <InputGroup>
                <InputLeftAddon children="¥" />
                <Input
                  className="mb-4 text-3xl"
                  style={{ fontSize: "30px" }}
                  value={amount}
                  onChange={(event) => {
                    setAmount(Number(event.target.value));
                  }}
                />
              </InputGroup>
              <div className="mb-8 grid grid-cols-3 gap-1">
                {[1000, 5000, 10000, 50000, 100000, 500000].map((item) => (
                  <Button
                    className="!rounded-sm"
                    variant={"outline"}
                    key={item}
                    onClick={() => {
                      setAmount(item / 100);
                    }}
                  >
                    ¥{item / 100}
                  </Button>
                ))}
              </div>
              <Button
                className="w-full !rounded-full"
                size="lg"
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

            {createOrderRes?.data?.result?.code_url && (
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
