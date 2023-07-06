import React from "react";
import { Avatar, Button } from "@chakra-ui/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import ChargeButton from "@/components/ChargeButton";
import { ExpendIcon, RechargeIcon } from "@/components/CommonIcon";
import { formatPrice, hidePhoneNumber } from "@/utils/format";

import useGlobalStore from "@/pages/globalStore";
import { useAccountQuery } from "@/pages/home/service";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

export default function Usage() {
  const { userInfo } = useGlobalStore((state) => state);
  const { data: accountRes } = useAccountQuery();
  return (
    <div>
      <div className="pb-6 text-2xl">成本总览</div>
      <div className="flex pb-6">
        <div className="flex flex-col pr-4">
          <span>我的账户</span>
          <div className="mt-3 flex h-36 w-[306px] flex-col justify-between rounded-lg bg-primary-500 px-6 text-white">
            <div className="flex items-center justify-between pt-3 text-lg">
              <span>{hidePhoneNumber(userInfo?.phone || "")}</span>
              <span className="flex items-center">
                {userInfo?.username} <Avatar className="ml-2" width={9} height={9} src="" />
              </span>
            </div>
            <div className="flex items-end justify-between pb-5">
              <span className="flex flex-col">
                <span>余额</span>
                <span className="text-[24px]">￥ {formatPrice(accountRes?.data?.balance)}</span>
              </span>
              <ChargeButton>
                <Button bg={"white"} textColor={"black"} _hover={{ bg: "primary.100" }}>
                  充值
                </Button>
              </ChargeButton>
            </div>
          </div>
        </div>
        <div>
          <span>我的收支</span>
          <div className="mt-3 flex">
            <div className="mr-4 h-36 w-36 rounded-lg border border-grayModern-200 bg-[#F4F6F8]">
              <div className="flex w-full justify-center pt-6">
                <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <ExpendIcon className="!text-white" w={"16px"} h={"16px"} />
                </div>
              </div>
              <div className="flex w-full justify-center pt-3">支出</div>
              <div className="flex w-full justify-center pt-3 text-xl">￥ 120.00</div>
            </div>
            <div className="h-36 w-36 rounded-lg border border-grayModern-200 bg-[#F4F6F8]">
              <div className="flex w-full justify-center pt-6">
                <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-adora-600">
                  <RechargeIcon className="!text-white" w={"16px"} h={"16px"} />
                </div>
              </div>
              <div className="flex w-full justify-center pt-3">充值</div>
              <div className="flex w-full justify-center pt-3 text-xl">￥ 120.00</div>
            </div>
          </div>
        </div>
      </div>
      <span>成本趋势</span>
      <ResponsiveContainer width={626} height={180} className="mt-3">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          {/* <YAxis /> */}
          <Tooltip />
          <Area type="monotone" dataKey="uv" stroke="#66CBCA" fill="#E6F6F6" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
