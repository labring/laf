import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

import { uniformCapacity } from "@/utils/format";

export default function PieCard(props: {
  data: any[];
  maxValue: number;
  title: string;
  colors: string[];
  appid?: string;
}) {
  const { t } = useTranslation();
  const { data, maxValue, title, colors, appid } = props;
  const usedData =
    uniformCapacity(data.find((item) => item.metric.database === appid)?.value[1]) || 0;
  const percentage = (usedData / maxValue) * 100;
  const pieData = useMemo(
    () =>
      [
        { name: `${t("Used")}`, value: usedData },
        { name: `${t("Remaining")}`, value: maxValue - usedData },
      ].filter((item) => item.value >= 0),
    [maxValue, t, usedData],
  );

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="absolute -top-14 right-0 w-24">
        {payload.map((entry: any, index: number) => (
          <div className="font-medium text-grayModern-900" key={index}>
            <span className="mt-3 flex items-center">
              <span
                className={`mr-1 h-2 w-2 rounded-full`}
                style={{ background: entry.color }}
              ></span>
              <p>{entry.value}</p>
            </span>
            <p className="text-nowrap ml-3 mt-1">{(pieData[index]?.value).toFixed(3)} MB</p>
          </div>
        ))}
      </ul>
    );
  };

  return (
    <div className="mb-2 h-full  rounded-xl border border-grayModern-200  bg-[#F8FAFB] p-4">
      <span className={clsx("flex items-center font-medium text-grayModern-900")}>
        <div className="mr-2 h-3 w-1 whitespace-nowrap rounded-xl bg-primary-600" />
        {title}
      </span>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            innerRadius={50}
            outerRadius={60}
            startAngle={90}
            cx="34%"
            endAngle={-270}
            legendType="circle"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <text
            x="36%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: "24px", fontWeight: "bold", userSelect: "none" }}
          >
            {!percentage ? "0.00" : percentage.toFixed(2)} %
          </text>
          <Legend align="right" verticalAlign="middle" layout="vertical" content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
