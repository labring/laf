import { useState } from "react";
import { Button } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { useSendEmailCodeMutation } from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

export function SendEmailCodeButton(props: {
  getEmail: any;
  className?: string;
  emailAccount?: string;
  type: string;
}) {
  const { getEmail, className, emailAccount, type } = props;
  const [isSendSmsCode, setIsSendSmsCode] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const sendSmsCodeMutation = useSendEmailCodeMutation();

  const { showSuccess, showError } = useGlobalStore();

  const handleSendSmsCode = async () => {
    const email = getEmail(emailAccount);

    if (isSendSmsCode) {
      return;
    }

    const isValidate = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    if (!isValidate) {
      showError(t("AuthPanel.EmailTip"));
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
      email,
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
