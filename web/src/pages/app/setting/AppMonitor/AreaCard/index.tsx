import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AreaCard(props: {
  data: any[];
  strokeColor: string;
  fillColor: string;
  title: string;
}) {
  const { data, strokeColor, fillColor, title } = props;

  return (
    <div className="h-[180px] w-1/2 rounded-xl border border-grayModern-200 bg-[#F8FAFB] p-4">
      <div className="mb-3 font-medium text-grayModern-900">{title}</div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ left: -30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize="10" />
          <YAxis axisLine={false} tickLine={false} fontSize="10" />
          <Tooltip
          // formatter={}
          />
          <Area
            type="monotone"
            dataKey="uv"
            stroke={strokeColor}
            fill={fillColor}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
