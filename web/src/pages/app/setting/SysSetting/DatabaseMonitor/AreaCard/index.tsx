import { useEffect, useState } from "react";
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

const strokeColorArray = [
  "#47C8BF",
  "#9A8EE0",
  "#FFA100",
  "#FF4D4F",
  "#52C41A",
  "#1890FF",
  "#FF7A45",
  "#FFC53D",
  "#FF85C0",
  "#A0D911",
  "#13C2C2",
  "#2F54EB",
  "#EB2F96",
  "#F5222D",
  "#FAAD14",
  "#722ED1",
  "#13C2C2",
  "#1890FF",
  "#722ED1",
  "#FAAD14",
];

const generateChartData = () => {
  const now = new Date();
  now.setSeconds(0, 0); // 整点
  const startTime = now.getTime() - 59 * 60 * 1000; // 计算起始时间戳
  return Array(60)
    .fill()
    .map((_, i) => ({ xData: startTime + i * 60 * 1000 }));
};

function mergeArrays(dataArrays) {
  const baseChartData = generateChartData();
  return baseChartData.map((basePoint) => {
    const mergedPoint = { xData: basePoint.xData };
    dataArrays.forEach((arr, index) => {
      mergedPoint[`value${index}`] =
        arr.find((p) => p.xData === basePoint.xData)?.[`value${index}`] || 0;
    });
    return mergedPoint;
  });
}

function extractNumber(str: string) {
  const match = str.match(/\d+$/) || [];
  return Number(match[0]);
}

const modifyTimestamp = (t) => {
  let date = new Date(t * 1000); // 将秒级时间戳转换为毫秒级
  date.setSeconds(0, 0); // 设置秒和毫秒都为0
  return date.getTime(); // 返回修改后的毫秒级时间戳
};

export default function AreaCard(props: {
  data: TCpuUsageData;
  strokeColor: string;
  fillColor: string;
  setLineNumber?: (value: number) => void;
  lineNumber: number;
  chartLines: string[];
  title: string;
  maxValue: number;
  unit: string;
  className?: string;
}) {
  const {
    data,
    strokeColor,
    fillColor,
    setLineNumber,
    lineNumber,
    chartLines,
    title,
    maxValue,
    unit,
    className,
  } = props;
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    if (lineNumber === 0) {
      let tempDataArray: any = [];
      data?.forEach((item, index) => {
        if (item.values) {
          const tempData = item.values.map((item) => {
            if (title === "CPU") {
              return {
                xData: modifyTimestamp(item[0]),
                [`value${index}`]: Number(item[1]),
              };
            } else {
              return {
                xData: modifyTimestamp(item[0]),
                [`value${index}`]: Number(item[1]) / 1024 / 1024,
              };
            }
          });
          tempDataArray.push(tempData);
        }
      });
      setChartData(mergeArrays(tempDataArray));
    }
    if (!data[lineNumber - 1]?.values) return;
    setChartData(
      data[lineNumber - 1]?.values.map((item) => {
        if (title === "CPU") {
          return {
            xData: item[0] * 1000,
            value0: Number(item[1]),
          };
        } else {
          return {
            xData: item[0] * 1000,
            value0: Number(item[1]) / 1024 / 1024,
          };
        }
      }),
    );
  }, [data, lineNumber, title]);

  return (
    <div className={className}>
      <div className="mb-3 flex justify-between font-medium text-grayModern-900">
        <span className={clsx("flex items-center")}>
          <div className="mr-2 h-3 w-1 whitespace-nowrap rounded-xl bg-primary-600" />
          {title}
        </span>
        {setLineNumber && chartLines && chartLines.length > 0 && (
          <Menu>
            <MenuButton className="text-grayModern-600">
              {chartLines[lineNumber]}
              {chartLines.length > 1 && <ChevronDownIcon />}
            </MenuButton>
            {chartLines.length > 1 && (
              <MenuList>
                {chartLines.map((pod, index) => (
                  <MenuItemOption
                    key={index}
                    value={String(index)}
                    onClick={() => setLineNumber(index)}
                    className="!px-0 !text-grayModern-600"
                  >
                    {pod}
                  </MenuItemOption>
                ))}
              </MenuList>
            )}
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
          {lineNumber === 0 && chartLines.length > 1 ? (
            <>
              <Tooltip
                formatter={(value, index) => [
                  chartLines[extractNumber(index as string) + 1] +
                    ": " +
                    Number(value).toFixed(3) +
                    unit,
                ]}
                labelFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
                labelStyle={{ color: "#24282C" }}
                contentStyle={{ fontFamily: "Consolas", opacity: 0.75 }}
              />
              {data?.map((item, index) => {
                return (
                  <Area
                    key={index}
                    type="monotone"
                    dataKey={`value${index}`}
                    stroke={strokeColorArray[index]}
                    fill={fillColor}
                    strokeWidth={2}
                  />
                );
              })}
            </>
          ) : (
            <>
              <Tooltip
                formatter={(value, index) => [Number(value).toFixed(3) + unit]}
                labelFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
                labelStyle={{ color: "#24282C" }}
                contentStyle={{ fontFamily: "Consolas", opacity: 0.75 }}
              />
              <Area
                type="monotone"
                dataKey="value0"
                stroke={strokeColor}
                fill={fillColor}
                strokeWidth={2}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
