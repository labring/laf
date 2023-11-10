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
  "#FAAD14"
]

function mergeArrays(arrays: any) {
  let mergedArray = [];
  const maxLength = Math.max(...arrays.map((arr: any) => arr.length));
  for (let i = 0; i < maxLength; i++) {
      let mergedElement = { xData: 0 };
      for (let j = 0; j < arrays.length; j++) {
          if (i < arrays[j].length) {
            mergedElement.xData = arrays[j][i].xData;
            // @ts-ignore
            mergedElement[`value${j}`] = arrays[j][i][`value${j}`];
          }
      }
      mergedArray.push(mergedElement);
  }

  return mergedArray;
}

function extractNumber(str: string) {
  const match = str.match(/\d+$/) || []; 
  return Number(match[0]); 
}

export default function AreaCard(props: {
  data: TCpuUsageData;
  strokeColor: string;
  fillColor: string;
  setDataNumber?: (value: number) => void;
  dataNumber: number;
  podsArray: string[];
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
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    if (dataNumber === 0) { 
      let tempDataArray:any = []
      data?.forEach((item, index) => {
        if (item.values) {
          const tempData = item.values.map((item) => {
            if (title === "CPU") {
              return {
                xData: item[0] * 1000,
                [`value${index}`]: Number(item[1]),
              };
            } else {
              return {
                xData: item[0] * 1000,
                [`value${index}`]: Number(item[1]) / 1024 / 1024,
              };
            }
          })
          tempDataArray.push(tempData)
        }
      })
      setChartData(mergeArrays(tempDataArray));
    }
    if (!data[dataNumber - 1]?.values) return;
    setChartData(
      data[dataNumber-1]?.values.map((item) => {
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
                  {pod}
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
            formatter={(value, index) => [ podsArray[extractNumber(index as string) + 1] + "  " + Number(value).toFixed(3) + unit]}
            labelFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
            labelStyle={{ color: "#24282C" }}
            contentStyle={{ fontFamily: "Consolas" }}
          />
          {
            dataNumber === 0 ? data?.map((item, index) => {
              return <Area
                key={index}
                type="monotone"
                dataKey={`value${index}`}
                stroke={strokeColorArray[index]}
                fill={fillColor}
                strokeWidth={2}
              />
            }) : <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              fill={fillColor}
              strokeWidth={2}
            />
          }
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
