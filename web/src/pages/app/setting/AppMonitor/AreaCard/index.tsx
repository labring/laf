import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuItemOption, MenuList } from "@chakra-ui/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate } from "@/utils/format";

export default function AreaCard(props: {
  data: any[];
  strokeColor: string;
  fillColor: string;
  title: string;
  maxValue: number;
  setDataNumber?: (value: number) => void;
  cpuDataArray?: any[];
  dataNumber: number;
  unit: string;
}) {
  const {
    data,
    strokeColor,
    fillColor,
    title,
    maxValue,
    setDataNumber,
    cpuDataArray,
    dataNumber,
    unit,
  } = props;
  const { t } = useTranslation();

  return (
    <div className="h-[180px] border-grayModern-200 p-4">
      <div className="mb-3 flex justify-between font-medium text-grayModern-900">
        <span className="whitespace-nowrap">{title}</span>
        {setDataNumber && cpuDataArray && (
          <Menu>
            <MenuButton className="text-grayModern-600">
              {cpuDataArray[dataNumber]?.metric.pod}
              <ChevronDownIcon />
            </MenuButton>
            <MenuList>
              {cpuDataArray.map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={String(index)}
                  onClick={() => setDataNumber(index)}
                  className="!px-0 !text-grayModern-600"
                >
                  {t("Pod") + ": " + item.metric.pod}
                </MenuItemOption>
              ))}
            </MenuList>
          </Menu>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -30, top: 6 }} syncId="sync">
          <CartesianGrid stroke="#f5f5f5" vertical={false} />
          <XAxis
            dataKey="xData"
            type="number"
            fontSize="10"
            tickFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
            tickCount={10}
            domain={[Date.now() - 60 * 60 * 1000, Date.now()]}
            className="!text-grayModern-100"
            stroke="#9CA2A8"
          />
          <YAxis fontSize="10" stroke="#9CA2A8" />
          <ReferenceLine
            y={maxValue}
            strokeDasharray="3 3"
            className="text-[10px]"
            label={maxValue + unit}
            ifOverflow="extendDomain"
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(3) + unit]}
            labelFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            fill={fillColor}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
