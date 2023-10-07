import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuItemOption, MenuList } from "@chakra-ui/react";
import clsx from "clsx";
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

import { TCpuUsageData } from "@/apis/typing";

export default function AreaCard(props: {
  data: TCpuUsageData;
  strokeColor: string;
  fillColor: string;
  setDataNumber?: (value: number) => void;
  dataNumber: number;
  podsArray?: string[];
  title: string;
  maxValue: number;
  unit: string;
  className?: string;
}) {
  const {
    data,
    strokeColor,
    fillColor,
    setDataNumber,
    dataNumber,
    podsArray,
    title,
    maxValue,
    unit,
    className,
  } = props;
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    if (!data[dataNumber]?.values) return;
    setChartData(
      data[dataNumber]?.values.map((item) => {
        if (title === "CPU") {
          return {
            xData: item[0] * 1000,
            value: Number(item[1]),
          };
        } else {
          return {
            xData: item[0] * 1000,
            value: Number(item[1]) / 1024 / 1024,
          };
        }
      }),
    );
  }, [data, dataNumber, title]);

  return (
    <div className={className}>
      <div className="mb-3 flex justify-between font-medium text-grayModern-900">
        <span className={clsx("flex items-center")}>
          <div className="mr-2 h-3 w-1 whitespace-nowrap rounded-xl bg-primary-600" />
          {title}
        </span>
        {setDataNumber && podsArray && podsArray.length > 0 && (
          <Menu>
            <MenuButton className="text-grayModern-600">
              {podsArray[dataNumber]}
              <ChevronDownIcon />
            </MenuButton>
            <MenuList>
              {podsArray.map((pod, index) => (
                <MenuItemOption
                  key={index}
                  value={String(index)}
                  onClick={() => setDataNumber(index)}
                  className="!px-0 !text-grayModern-600"
                >
                  {t("Pod") + ": " + pod}
                </MenuItemOption>
              ))}
            </MenuList>
          </Menu>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: -28, top: 6 }} syncId="sync">
          <CartesianGrid stroke="#f5f5f5" vertical={false} />
          <XAxis
            dataKey="xData"
            type="number"
            fontSize="10"
            color="#9CA2A8"
            tickFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
            tickCount={10}
            domain={[Date.now() - 60 * 60 * 1000, Date.now()]}
            stroke="#C0C2D2"
          />
          <YAxis fontSize="10" stroke="#9CA2A8" />
          <ReferenceLine
            y={maxValue}
            strokeDasharray="3 3"
            className="text-[10px]"
            label={maxValue + " " + unit}
            ifOverflow="extendDomain"
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(3) + " " + unit]}
            labelFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
            labelStyle={{ color: "#24282C" }}
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
