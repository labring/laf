import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuItemOption, MenuList } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";
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
  now.setSeconds(0, 0);
  const startTime = now.getTime() - 59 * 60 * 1000;
  return Array(60)
    .fill({ xData: 0 })
    .map((_, i) => ({ xData: startTime + i * 60 * 1000 }));
};

type DataPoint = {
  xData: number;
  [key: string]: number | undefined;
};

function mergeArrays(dataArrays: (DataPoint[] | null)[]): DataPoint[] {
  const baseChartData = generateChartData();
  return baseChartData.map((basePoint) => {
    const mergedPoint: DataPoint = { xData: basePoint.xData };
    dataArrays.forEach((arr) => {
      if (!arr || arr.length === 0) return;
      const matchingPoint = arr.find((p) => p.xData === basePoint.xData);
      if (matchingPoint) {
        Object.keys(matchingPoint).forEach((key) => {
          if (key !== "xData") {
            mergedPoint[key] = matchingPoint[key] ?? 0;
          }
        });
      } else {
        Object.keys(arr[0]).forEach((key) => {
          if (key !== "xData") {
            mergedPoint[key] = undefined;
          }
        });
      }
    });
    return mergedPoint;
  });
}

function getLineName(data: any) {
  if (data.metric.state && data.metric.pod) {
    return `${data.metric.pod}-${data.metric.state}`;
  }
  if (data.metric.type && data.metric.pod) {
    return `${data.metric.pod}-${data.metric.type}`;
  }
  if (data.metric.pod) {
    return `${data.metric.pod}`;
  }
  return "yData";
}

const modifyTimestamp = (t: number) => {
  let date = new Date(t * 1000); // 将秒级时间戳转换为毫秒级
  date.setSeconds(0, 0); // 设置秒和毫秒都为0
  return date.getTime(); // 返回修改后的毫秒级时间戳
};

export default function AreaCard(props: {
  data: TCpuUsageData;
  strokeColor: string;
  fillColor: string;
  setPodName?: (value: string) => void;
  podName: string | null;
  podList: string[];
  title: string;
  maxValue: number;
  unit: string;
  className?: string;
  syncId: string;
  longestTick: string;
  onLongestTickChange: (val: string) => void;
}) {
  const {
    data,
    fillColor,
    setPodName,
    podName,
    podList,
    title,
    maxValue,
    unit,
    className,
    syncId,
    longestTick,
    onLongestTickChange,
  } = props;
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    if (podName === t("All")) {
      const tempDataArray: any = [];
      data?.forEach((item, index) => {
        const lineName = getLineName(item);
        if (item.values) {
          const tempData = item.values.map((item) => {
            if (title === t("Spec.RAM")) {
              return {
                xData: modifyTimestamp(item[0]),
                [lineName]: Number(item[1]) / 1024 / 1024,
              };
            }
            return {
              xData: modifyTimestamp(item[0]),
              [lineName]: Number(item[1]),
            };
          });
          tempDataArray.push(tempData);
        }
      });
      setChartData(mergeArrays(tempDataArray));
    } else {
      const tempDataArray: any = [];
      data?.forEach((item, index) => {
        const lineName = getLineName(item);
        if (item.metric.pod === podName && item.values) {
          const tempData = item.values.map((item) => {
            if (title === t("Spec.RAM")) {
              return {
                xData: modifyTimestamp(item[0]),
                [lineName]: Number(item[1]) / 1024 / 1024,
              };
            }
            return {
              xData: modifyTimestamp(item[0]),
              [lineName]: Number(item[1]),
            };
          });
          tempDataArray.push(tempData);
        }
      });
      setChartData(mergeArrays(tempDataArray));
    }
  }, [data, podName, title]);

  const tickFormatter = (val: string) => {
    const formattedTick = val.toString();
    if (longestTick.length < formattedTick.length) {
      onLongestTickChange(formattedTick);
    }
    return val;
  };

  return (
    <div className={className}>
      <div className="mb-3 flex justify-between font-medium text-grayModern-900">
        <span className={clsx("flex items-center")}>
          <div className="mr-2 h-3 w-1 whitespace-nowrap rounded-xl bg-primary-600" />
          {title}
        </span>
        {setPodName && podList && podList.length > 1 && (
          <Menu>
            <MenuButton className="text-grayModern-600">
              {podName}
              {podList.length > 1 && <ChevronDownIcon />}
            </MenuButton>
            {podList.length > 1 && (
              <MenuList>
                {podList.map((podName, index) => (
                  <MenuItemOption
                    key={index}
                    onClick={() => setPodName(podName)}
                    className="!px-0 !text-grayModern-600"
                  >
                    {podName}
                  </MenuItemOption>
                ))}
              </MenuList>
            )}
          </Menu>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 6 }}
          {...(syncId !== "" ? { syncId: syncId } : {})}
        >
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
          <YAxis
            fontSize="10"
            stroke="#9CA2A8"
            width={longestTick.length * 8 + 8}
            tickFormatter={tickFormatter}
          />

          {maxValue !== 0 && (
            <ReferenceLine
              y={maxValue}
              strokeDasharray="3 3"
              className="text-[10px]"
              label={`${maxValue} ${unit}`}
              ifOverflow="extendDomain"
            />
          )}

          {podName === t("All") && podList.length > 1 ? (
            <>
              <Tooltip
                formatter={(value, index) => [index + ": " + Number(value).toFixed(3) + unit]}
                labelFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
                labelStyle={{ color: "#24282C" }}
                contentStyle={{ fontFamily: "Consolas", opacity: 0.75 }}
                wrapperStyle={{ zIndex: 100, position: "absolute" }}
              />
              {data?.map((item, index) => {
                return (
                  <Area
                    key={index}
                    type="monotone"
                    dataKey={getLineName(item)}
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
                formatter={(value, index) => [index + ": " + Number(value).toFixed(3) + unit]}
                labelFormatter={(value) => formatDate(new Date(value)).split(" ")[1]}
                labelStyle={{ color: "#24282C" }}
                contentStyle={{ fontFamily: "Consolas", opacity: 0.75 }}
                wrapperStyle={{ zIndex: 100 }}
              />
              {data?.map((item, index) => {
                if (item.metric.pod === podName) {
                  return (
                    <Area
                      key={index}
                      type="monotone"
                      dataKey={getLineName(item)}
                      stroke={strokeColorArray[index]}
                      fill={fillColor}
                      strokeWidth={2}
                    />
                  );
                } else {
                  return null;
                }
              })}
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
