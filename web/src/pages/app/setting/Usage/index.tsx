import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Button, useColorMode } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChargeButton from "@/components/ChargeButton";
import { CostIcon, ExpendIcon, RechargeIcon } from "@/components/CommonIcon";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate, formatPrice, hidePhoneNumber } from "@/utils/format";

import { AccountControllerGetChargeOrderAmount } from "@/apis/v1/accounts";
import { BillingControllerGetExpense, BillingControllerGetExpenseByDay } from "@/apis/v1/billings";
import useGlobalStore from "@/pages/globalStore";
import { useAccountQuery } from "@/pages/home/service";

const DEFAULT_QUERY_DATA = {
  appid: [],
  startTime: "",
  endTime: "",
  page: 1,
  pageSize: 10,
  state: "",
};

export default function Usage() {
  const { userInfo } = useGlobalStore((state) => state);
  const { data: accountRes } = useAccountQuery();
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";

  const [startTime, setStartTime] = React.useState<Date | null>(
    new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000),
  );
  const [endTime, setEndTime] = React.useState<Date | null>(new Date());
  const [queryData, setQueryData] = React.useState(DEFAULT_QUERY_DATA);

  const { data: billingAmountRes } = useQuery(["billing", queryData], async () => {
    return BillingControllerGetExpense({
      startTime: startTime?.toISOString(),
      endTime: endTime?.toISOString(),
    });
  });

  const { data: chargeOrderAmountRes } = useQuery(
    ["chargeOrderAmount", startTime, endTime],
    async () => {
      return AccountControllerGetChargeOrderAmount({
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
      });
    },
  );

  const { data: billingAmountByDayRes } = useQuery(
    ["billingByDay", startTime, endTime],
    async () => {
      return BillingControllerGetExpenseByDay({
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
      });
    },
  );

  const chartData = ((billingAmountByDayRes?.data as Array<any>) || []).map((item) => ({
    ...item,
    date: formatDate(item.day).slice(5, 10),
  }));

  return (
    <div>
      <div className="flex items-center pb-6 pt-2 text-2xl">
        <span className="pr-4">
          <CostIcon boxSize={5} mr={3} />
          {t("SettingPanel.Usage")}
        </span>
        <DateRangePicker
          startTime={startTime}
          endTime={endTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
          setQueryData={setQueryData}
        />
      </div>
      <div className="flex pb-6 pl-8">
        <div className="flex flex-col pr-4">
          <span>{t("SettingPanel.MyAccount")}</span>
          <div className="mt-3 flex h-36 w-[306px] flex-col justify-between rounded-lg bg-primary-500 px-6 text-white">
            <div className="flex items-center justify-between pt-3 text-lg">
              <span>{hidePhoneNumber(userInfo?.phone || "")}</span>
              <span className="flex items-center">
                {userInfo?.username} <Avatar className="ml-2" width={9} height={9} src="" />
              </span>
            </div>
            <div className="flex items-end justify-between pb-5">
              <span className="flex flex-col">
                <span>{t("Balance")}</span>
                <span className="text-[24px]">{formatPrice(accountRes?.data?.balance)}</span>
              </span>
              <ChargeButton>
                <Button bg={"white"} textColor={"black"} _hover={{ bg: "primary.100" }}>
                  {t("ChargeNow")}
                </Button>
              </ChargeButton>
            </div>
          </div>
        </div>
        <div>
          <span>{t("MyIncomeAndExpenses")}</span>
          <div className="mt-3 flex">
            <div
              className={clsx(
                "mr-4 h-36 w-36 rounded-lg border border-grayModern-200",
                !darkMode && "bg-[#F4F6F8]",
              )}
            >
              <div className="flex w-full justify-center pt-6">
                <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <ExpendIcon className="!text-white" w={"16px"} h={"16px"} />
                </div>
              </div>
              <div className="flex w-full justify-center pt-3">{t("Expenses")}</div>
              <div className="flex w-full justify-center pt-3 text-xl">
                {formatPrice(billingAmountRes?.data as number)}
              </div>
            </div>
            <div
              className={clsx(
                "h-36 w-36 rounded-lg border border-grayModern-200",
                !darkMode && "bg-[#F4F6F8]",
              )}
            >
              <div className="flex w-full justify-center pt-6">
                <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-adora-600">
                  <RechargeIcon className="!text-white" w={"16px"} h={"16px"} />
                </div>
              </div>
              <div className="flex w-full justify-center pt-3">{t("ChargeNow")}</div>
              <div className="flex w-full justify-center pt-3 text-xl">
                {formatPrice(chargeOrderAmountRes?.data as number)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="pl-8">{t("SettingPanel.CostTrend")}</span>
      <div className="mt-3 h-[160px] w-[660px] pl-8">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <AreaChart data={chartData} margin={{ left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="totalAmount"
              stroke="#66CBCA"
              fill="#E6F6F6"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
