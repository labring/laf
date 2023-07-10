import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Button, Center, Spinner, useColorMode } from "@chakra-ui/react";
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
import { formatDate, formatOriginalPrice, formatPrice, hidePhoneNumber } from "@/utils/format";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import { AccountControllerGetChargeOrderAmount } from "@/apis/v1/accounts";
import { BillingControllerGetExpense, BillingControllerGetExpenseByDay } from "@/apis/v1/billings";
import useGlobalStore from "@/pages/globalStore";
import { useAccountQuery } from "@/pages/home/service";

const DATA_DURATION = 6 * 24 * 60 * 60 * 1000;

export default function Usage() {
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";
  const [startTime, setStartTime] = React.useState<Date | null>(
    new Date(new Date().getTime() - DATA_DURATION),
  );

  const [endTime, setEndTime] = React.useState<Date | null>(new Date());

  const { userInfo } = useGlobalStore((state) => state);
  const { data: accountRes } = useAccountQuery();

  const { data: billingAmountRes, isLoading: billLoading } = useQuery(
    ["billing", startTime, endTime],
    async () => {
      return BillingControllerGetExpense({
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
      });
    },
  );

  const { data: chargeOrderAmountRes, isLoading: chargeLoading } = useQuery(
    ["chargeOrderAmount", startTime, endTime],
    async () => {
      return AccountControllerGetChargeOrderAmount({
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
      });
    },
  );

  const { data: billingAmountByDayRes, isLoading: billingLoading } = useQuery(
    ["billingByDay", startTime, endTime],
    async () => {
      return BillingControllerGetExpenseByDay({
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
      });
    },
  );

  const chartData = ((billingAmountByDayRes?.data as Array<any>) || []).map((item) => ({
    totalAmount: item.totalAmount,
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
        />
      </div>
      <div className="flex pb-6 pl-8">
        <div className="flex flex-col pr-4">
          <span>{t("SettingPanel.MyAccount")}</span>
          <div className="mt-3 flex h-36 w-[306px] flex-col justify-between rounded-lg bg-primary-500 px-6 text-white">
            <div className="flex items-center justify-between pt-3 text-lg">
              <span>{hidePhoneNumber(userInfo?.phone || "")}</span>
              <span className="flex items-center">
                {userInfo?.username}{" "}
                <Avatar
                  className="ml-2"
                  width={9}
                  height={9}
                  src={getAvatarUrl(userInfo?._id || "")}
                />
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
                {billLoading ? (
                  <Spinner size={"sm"} />
                ) : (
                  formatOriginalPrice(billingAmountRes?.data as number)
                )}
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
                {chargeLoading ? (
                  <Spinner size={"sm"} />
                ) : (
                  formatPrice(chargeOrderAmountRes?.data as number)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="pl-8">{t("SettingPanel.CostTrend")}</span>
      <div className="mt-3 h-[160px] w-[660px] pl-8">
        {billingLoading ? (
          <Center className="h-full w-full">
            <Spinner />
          </Center>
        ) : (
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <AreaChart data={chartData} margin={{ left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [formatOriginalPrice(Number(value), 3), t("Expenses")]}
              />
              <Area
                type="monotone"
                dataKey="totalAmount"
                stroke="#66CBCA"
                fill="#E6F6F6"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
