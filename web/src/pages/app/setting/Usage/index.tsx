import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Button } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
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
import { formatPrice, hidePhoneNumber } from "@/utils/format";

import { BillingControllerFindAll } from "@/apis/v1/billings";
import useGlobalStore from "@/pages/globalStore";
import { useAccountQuery } from "@/pages/home/service";

const data = [
  {
    name: "Day 1",
    total: 4000,
  },
  {
    name: "Day 2",
    total: 3000,
  },
  {
    name: "Day 3",
    total: 2000,
  },
  {
    name: "Day 4",
    total: 2780,
  },
  {
    name: "Day 5",
    total: 4000,
  },
  {
    name: "Day 6",
    total: 3000,
  },
  {
    name: "Day 7",
    total: 2000,
  },
];

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
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [queryData, setQueryData] = React.useState(DEFAULT_QUERY_DATA);

  const { data: billingRes } = useQuery(["billing", queryData], async () => {
    return BillingControllerFindAll({
      ...queryData,
    });
  });

  console.log(billingRes);

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
      <div className="flex pb-6">
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
          <span>{t("MyIncomeandExpenses")}</span>
          <div className="mt-3 flex">
            <div className="mr-4 h-36 w-36 rounded-lg border border-grayModern-200 bg-[#F4F6F8]">
              <div className="flex w-full justify-center pt-6">
                <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <ExpendIcon className="!text-white" w={"16px"} h={"16px"} />
                </div>
              </div>
              <div className="flex w-full justify-center pt-3">{t("Expenses")}</div>
              <div className="flex w-full justify-center pt-3 text-xl">￥ 120.00</div>
            </div>
            <div className="h-36 w-36 rounded-lg border border-grayModern-200 bg-[#F4F6F8]">
              <div className="flex w-full justify-center pt-6">
                <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-adora-600">
                  <RechargeIcon className="!text-white" w={"16px"} h={"16px"} />
                </div>
              </div>
              <div className="flex w-full justify-center pt-3">{t("ChargeNow")}</div>
              <div className="flex w-full justify-center pt-3 text-xl">￥ 120.00</div>
            </div>
          </div>
        </div>
      </div>
      <span>{t("SettingPanel.CostTrend")}</span>
      <div className="mt-3 h-[160px] w-[626px]">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <AreaChart data={data} margin={{ left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="total" stroke="#66CBCA" fill="#E6F6F6" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
