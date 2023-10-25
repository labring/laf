import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { Logo, LogoText } from "@/components/LogoIcon";

export default function ActivityModal(props: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) {
  const { onClose, isOpen, onOpen } = useDisclosure();
  const { showModal, setShowModal } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (showModal) {
      onOpen();
    }
  }, [onOpen, showModal]);
  if (["laf.run", "laf.dev"].includes(window.location.hostname)) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent rounded="16px" ml="-40">
          <ModalBody className="w-[600px] rounded-2xl bg-white !p-0 !pb-12">
            <div
              className="flex !h-16 items-center justify-center space-x-3 rounded-t-2xl"
              style={{ background: "linear-gradient(90deg, #E6F2F4 0%, #CAE8EE 101.17%)" }}
            >
              <Logo size="30px" outerColor="#00BAA4" innerColor="white" />
              <LogoText size="40px" color="#021513" />
            </div>
            <Button
              variant="none"
              className="!absolute -right-28 top-4 !p-0 !text-grayModern-600"
              onClick={() => {
                onClose();
                setShowModal(false);
                localStorage.setItem("modal_lastCanceledTime", new Date().getTime().toString());
              }}
            >
              {t("ThinkMore")}
            </Button>
            <VStack className="text-[#13091C]">
              <span className="mb-7 mt-20 text-3xl font-semibold">🎉 {t("Activity_Modal1")}</span>
              <p className="text-2xl font-semibold text-[#262A32]">{t("Activity_Modal2")}</p>
              <p className="text-2xl font-semibold text-[#262A32]">{t("Activity_Modal3")}</p>
              <Button
                className="!mt-12 !h-[44px] w-[360px] !bg-primary-600 !text-lg !text-white"
                onClick={() => {
                  localStorage.setItem("charge", true.toString());
                  navigate("/dashboard");
                }}
              >
                {t("RechargeNow")}
              </Button>
              <Button
                className="!mt-4 !h-[44px] w-[360px] !bg-primary-100 !text-lg !text-primary-600"
                onClick={() => {
                  window.open("https://fael3z0zfze.feishu.cn/docx/N6C0dl2szoxeX8xtIcAcKSXRn8e");
                }}
              >
                {t("Details")}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  } else {
    return null;
  }
}