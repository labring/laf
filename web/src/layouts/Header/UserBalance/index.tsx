import { useTranslation } from "react-i18next";

import ChargeButton from "@/components/ChargeButton";
import { formatPrice } from "@/utils/format";

import { useAccountQuery } from "@/pages/home/service";

export default function UserBalance() {
  const { t } = useTranslation();
  const { data: { data: balanceData = {} } = {} } = useAccountQuery();

  return (
    <div className="flex rounded bg-primary-100 px-4 py-2 text-lg font-semibold text-primary-600">
      <span className="mr-2 flex border-r-[2px] border-primary-400 pr-2">
        <p className="mr-2">{t("SettingPanel.Balance")}</p>
        <p>{formatPrice(balanceData.balance)}</p>
      </span>
      <ChargeButton>
        <span className="cursor-pointer font-semibold">{t("ChargeNow")}</span>
      </ChargeButton>
    </div>
  );
}
