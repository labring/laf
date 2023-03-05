import React from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";
import { QRCodeSVG } from "qrcode.react";

export default function ChargeButton(props: { children: React.ReactElement }) {
  const { children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      {React.cloneElement(children, { onClick: onOpen })}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent marginTop={40}>
          <ModalHeader>{t("Charge")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex flex-col items-center">
              <h2>当前余额</h2>
              <h3>¥ 0.00</h3>
              <p>充值金额</p>
              <Input type="number" />
              <Button>确定</Button>
            </div>

            <div className="flex flex-col items-center">
              <p>订单号：a2b6fc440f9978d53d7b4ad0a52e752e</p>
              <QRCodeSVG value="https://reactjs.org/" />
              <h2>微信扫码支付</h2>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
