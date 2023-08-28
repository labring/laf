import { useState } from "react";
import { Button } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { TSmsCode } from "@/apis/typing";
import { useSendSmsCodeMutation } from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

export function SendSmsCodeButton(props: {
  getPhone: any;
  className?: string;
  phoneNumber?: string;
  type: TSmsCode;
}) {
  const { getPhone, className, phoneNumber, type } = props;
  const [isSendSmsCode, setIsSendSmsCode] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const sendSmsCodeMutation = useSendSmsCodeMutation();

  const { showSuccess, showError } = useGlobalStore();

  const handleSendSmsCode = async () => {
    const phone = getPhone(phoneNumber);

    if (isSendSmsCode) {
      return;
    }

    const isValidate = /^1[2-9]\d{9}$/.test(phone);
    if (!isValidate) {
      showError(t("AuthPanel.PhoneTip"));
      return;
    }

    setIsSendSmsCode(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((countdown) => {
        if (countdown === 0) {
          clearInterval(timer);
          setIsSendSmsCode(false);
          return 0;
        }
        return countdown - 1;
      });
    }, 1000);

    const res = await sendSmsCodeMutation.mutateAsync({
      phone,
      type,
    });

    if (res?.data) {
      showSuccess(t("AuthPanel.SmsCodeSendSuccess"));
    }
  };

  return (
    <Button
      className={clsx("w-20", className)}
      variant={isSendSmsCode ? "text_disabled" : "text"}
      onClick={handleSendSmsCode}
    >
      {isSendSmsCode ? `${countdown}s` : t("AuthPanel.getValidationCode")}
    </Button>
  );
}
