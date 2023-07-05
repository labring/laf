import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";

import ResetPassword from "@/pages/auth/reset-password";

export default function UserNameEditor(props: { handleBack: any }) {
  const { handleBack } = props;
  const { t } = useTranslation();

  return (
    <>
      <span
        onClick={() => handleBack()}
        className="absolute left-[280px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <div className="flex flex-col">
        <span className="w-full text-center text-xl">{t("UserInfo.EditPassword")}</span>
        <ResetPassword isModal={true} handleBack={handleBack} />
      </div>
    </>
  );
}
