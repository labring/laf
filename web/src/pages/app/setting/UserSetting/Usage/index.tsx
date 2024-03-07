import React, { useMemo } from "react";
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
import { formatDate, formatOriginalPrice, formatPrice } from "@/utils/format";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import { AccountControllerGetChargeOrderAmount } from "@/apis/v1/accounts";
import { BillingControllerGetExpense, BillingControllerGetExpenseByDay } from "@/apis/v1/billings";
import useGlobalStore from "@/pages/globalStore";
import { useAccountQuery } from "@/pages/home/service";

const DATA_DURATION = 6 * 24 * 60 * 60 * 1000;

export default function Usage() {
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";
  const [endTime, setEndTime] = React.useState<Date>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  });
  const [startTime, setStartTime] = React.useState<Date>(() => {
    const today = new Date();
    today.setTime(today.getTime() - DATA_DURATION);
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const { userInfo, avatarUpdatedAt } = useGlobalStore((state) => state);
  const { data: accountRes } = useAccountQuery();

  const { data: billingAmountRes, isLoading: billLoading } = useQuery(
    ["billing", startTime, endTime],
    async () => {
      const startOfDay = new Date(startTime);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endTime);
      endOfDay.setHours(23, 59, 59, 999);
      return BillingControllerGetExpense({
        startTime: startOfDay?.getTime(),
        endTime: endOfDay?.getTime(),
      });
    },
  );

  const { data: chargeOrderAmountRes, isLoading: chargeLoading } = useQuery(
    ["chargeOrderAmount", startTime, endTime],
    async () => {
      const startOfDay = new Date(startTime);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endTime);
      endOfDay.setHours(23, 59, 59, 999);
      return AccountControllerGetChargeOrderAmount({
        startTime: startOfDay?.getTime(),
        endTime: endOfDay?.getTime(),
      });
    },
  );

  const { data: billingAmountByDayRes, isLoading: billingLoading } = useQuery(
    ["billingByDay", startTime, endTime],
    async () => {
      const startOfDay = new Date(startTime);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endTime);
      endOfDay.setHours(23, 59, 59, 999);
      return BillingControllerGetExpenseByDay({
        startTime: startOfDay?.getTime(),
        endTime: endOfDay?.getTime(),
      });
    },
  );

  const chartData = useMemo(
    () =>
      ((billingAmountByDayRes?.data as Array<any>) || [])
        .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
        .map((item) => ({
          totalAmount: item.totalAmount,
          date: formatDate(item.day).slice(5, 10),
        })),
    [billingAmountByDayRes?.data],
  );

  return (
    <div>
      <div className="flex items-center pb-6 pt-2 text-2xl">
        <span className="flex items-center space-x-2 pr-4">
          <CostIcon size={20} color={darkMode ? "#F4F6F8" : "#24282C"} />
          <p>{t("SettingPanel.CostOverview")}</p>
        </span>
        <DateRangePicker
          startTime={startTime}
          endTime={endTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
        />
      </div>
      <div className="flex pb-6 pl-14">
        <div className="flex flex-col pr-4">
          <span>{t("SettingPanel.MyAccount")}</span>
          <div className="mt-3 flex h-36 w-[306px] flex-col justify-between rounded-lg bg-primary-500 px-6 text-white">
            <div className="flex items-center justify-end pt-3 text-lg">
              <span className="flex items-center">
                <span className="flex w-16 justify-end truncate">{userInfo?.username}</span>
                <Avatar
                  className="ml-2"
                  boxShadow="base"
                  boxSize="9"
                  src={getAvatarUrl(userInfo?._id, avatarUpdatedAt)}
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
                  {t("Charge")}
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
                "mr-4 h-36 w-36 rounded-lg border border-frostyNightfall-200",
                !darkMode && "bg-lafWhite-500",
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
                "h-36 w-36 rounded-lg border border-frostyNightfall-200",
                !darkMode && "bg-lafWhite-500",
              )}
            >
              <div className="flex w-full justify-center pt-6">
                <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-adora-600">
                  <RechargeIcon className="!text-white" w={"16px"} h={"16px"} />
                </div>
              </div>
              <div className="flex w-full justify-center pt-3">{t("Charge")}</div>
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
      <span className="pl-14">{t("SettingPanel.CostTrend")}</span>
      <div className="mt-3 h-[160px] w-[660px] pl-12">
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
