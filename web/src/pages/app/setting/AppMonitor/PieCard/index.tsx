import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

export default function PieCard(props: { data: any[]; title: string; colors: string[] }) {
  const { data, title, colors } = props;
  const percentage = (data[0]?.value / (data[0]?.value + data[1]?.value)) * 100;
  const pieData = data.filter((item) => item.value >= 0);

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul>
        {payload.map((entry: any, index: number) => (
          <div className="font-medium">
            <span className="mt-3 flex items-center">
              <span
                className={`mr-1 h-2 w-2 rounded-full`}
                style={{ background: entry.color }}
              ></span>
              <p>{entry.value}</p>
            </span>
            <p className="ml-3 mt-1">{(data[index]?.value).toFixed(3)} MB</p>
          </div>
        ))}
      </ul>
    );
  };

  return (
    <div className="mb-2 h-[188px] rounded-xl border border-grayModern-200 bg-[#F8FAFB] p-4">
      <div className="font-medium text-grayModern-900">{title}</div>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={pieData}
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
