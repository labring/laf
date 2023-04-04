import React, { useEffect } from "react";
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

  const initialAmount = props.amount && props.amount > 0 ? props.amount : 100;

  const [amount, setAmount] = React.useState(initialAmount);

  const [phaseStatus, setPhaseStatus] = React.useState<"Pending" | "Paid" | undefined>();

  const createChargeOrder = useMutation(
    ["AccountControllerCharge"],
    (params: any) => AccountControllerCharge(params),
    {},
  );

  const accountQuery = useAccountQuery();

  useQuery(
    ["AccountControllerGetChargeOrder"],
    () =>
      AccountControllerGetChargeOrder({
        id: createChargeOrder.data?.data?.order?.id,
      }),
    {
      enabled: !!createChargeOrder.data?.data?.order?.id && isOpen,
      refetchInterval: phaseStatus === "Pending" && isOpen ? 1000 : false,
      onSuccess: (data) => {
        setPhaseStatus(data.phase);
        if (data.phase === "Paid") {
          accountQuery.refetch();
          onClose();
        }
      },
    },
  );

  useEffect(() => {
    const initialAmount = props.amount && props.amount > 0 ? props.amount : 100;
    setAmount(initialAmount);
  }, [props.amount]);

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
                {formatPrice(accountQuery.data?.balance)}
              </h3>
              <p className="mb-2 text-second">{t("Recharge amount")}</p>
              <InputGroup>
                <InputLeftAddon children="¥" />
                <Input
                  className="mb-4 text-3xl"
                  style={{ fontSize: "30px" }}
                  defaultValue={amount}
                  onChange={(event) => {
                    setAmount(Number(event.target.value));
                  }}
                />
              </InputGroup>
              <Button
                className="w-full !rounded-full"
                size="lg"
                isLoading={createChargeOrder.isLoading}
                onClick={() => {
                  createChargeOrder.mutateAsync({
                    amount: convertMoney(amount),
                    channel: CHARGE_CHANNEL.WeChat,
                    currency: CURRENCY.CNY,
                  });
                }}
              >
                {t("Confirm")}
              </Button>
            </div>

            {createChargeOrder.data?.data?.result?.code_url && (
              <div className="mt-4 flex flex-col items-center text-xl ">
                <h2 className="mb-2">{t("Scan with WeChat")}</h2>
                <QRCodeSVG
                  value={createChargeOrder.data?.data?.result?.code_url}
                  width={180}
                  height={180}
                />
                <p className="mt-4 text-base text-second ">
                  {t("Order Number")}：{createChargeOrder.data?.data?.order?.id}
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
