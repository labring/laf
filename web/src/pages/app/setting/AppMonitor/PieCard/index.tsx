import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function PieCard(props: { data: any[]; title: string; colors: string[] }) {
  const { data, title, colors } = props;

  return (
    <div className="h-[180px] w-1/2 rounded-xl border border-grayModern-200 bg-[#F8FAFB] p-4">
      <div className="font-medium text-grayModern-900">{title}</div>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Tooltip />
          <Pie
            data={data}
            cx="50%"
            innerRadius={50}
            outerRadius={60}
            startAngle={90}
            endAngle={-270}
            legendType="circle"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <text
            x="40%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: "24px", fontWeight: "bold" }}
          >
            66%
          </text>
          <Legend align="right" verticalAlign="middle" layout="vertical" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
