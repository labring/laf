import { useTranslation } from "react-i18next";

import ChargeButton from "@/components/ChargeButton";
import { formatPrice } from "@/utils/format";

import { useAccountQuery } from "@/pages/home/service";

export default function UserBalance() {
  const { t } = useTranslation();
  const { data: { data: balanceData = {} } = {} } = useAccountQuery();

  return (
    <div className="flex rounded-lg bg-primary-100 px-4 py-2 text-lg font-semibold text-primary-600">
      <span className="mr-2 whitespace-nowrap">
        {t("SettingPanel.Balance") + " " + formatPrice(balanceData.balance)}
      </span>
      <span className="flex items-center text-base text-primary-400">|</span>
      <ChargeButton>
        <span className="ml-2 cursor-pointer whitespace-nowrap font-semibold">{t("Charge")}</span>
      </ChargeButton>
    </div>
  );
}
