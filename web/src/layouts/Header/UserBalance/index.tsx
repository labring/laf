import { useTranslation } from "react-i18next";

import ChargeButton from "@/components/ChargeButton";
import { formatPrice } from "@/utils/format";

import { useAccountQuery } from "@/pages/home/service";

export default function UserBalance() {
  const { t } = useTranslation();
  const { data: { data: balanceData = {} } = {} } = useAccountQuery();

  return (
    <div className="mr-4 text-lg">
      <span className="mr-2">{t("Balance")}:</span>
      <span className="mr-2">{formatPrice(balanceData.balance)}</span>
      <ChargeButton>
        <span className="cursor-pointer font-normal text-blue-800">{t("ChargeNow")}</span>
      </ChargeButton>
    </div>
  );
}
