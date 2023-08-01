import MonitorCard from "./AreaCard";
import PieCard from "./PieCard";

const data = [
  [
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
  ],
  [
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
  ],
];

const data2 = [
  { name: "Group A", value: 600 },
  { name: "Group B", value: 300 },
];

const data3 = [
  { name: "Group C", value: 400 },
  { name: "Group D", value: 200 },
];

export default function AppMonitor() {
  return (
    <>
      <div className="mr-2 mt-8 flex space-x-4">
        <MonitorCard data={data[0]} strokeColor="#47C8BF" fillColor="#E6F6F6" title="CPU(30%)" />
        <MonitorCard data={data[1]} strokeColor="#9A8EE0" fillColor="#F2F1FB" title="内存(30%)" />
      </div>
      <div className="mr-2 mt-4 flex space-x-4">
        <PieCard data={data2} title="数据库" colors={["#47C8BF", "#D5D6E1"]} />
        <PieCard data={data3} title="云存储" colors={["#9A8EE0", "#D5D6E1"]} />
      </div>
    </>
  );
}
