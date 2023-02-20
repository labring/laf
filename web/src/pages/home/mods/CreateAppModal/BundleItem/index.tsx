import React from "react";
import clsx from "clsx";

import { TBundle } from "@/apis/typing";

const ListItem = (props: { item: { key: string; value: string | number } }) => {
  const { item } = props;
  return (
    <div className="flex justify-between text-second mb-1">
      <div>{item.key}</div>
      <div>{item.value}</div>
    </div>
  );
};

export default function BundleItem(props: {
  onChange: (...event: any[]) => void;
  bundle: TBundle;
  isActive: boolean;
}) {
  const { bundle, isActive, onChange } = props;
  return (
    <div
      onClick={() => onChange(bundle.name)}
      key={bundle.name}
      className={clsx("min-w-[170px] border p-2 rounded-md", {
        "border-primary-500 bg-primary-100": isActive,
      })}
    >
      <div
        className={clsx("pb-2 border-b mb-2", {
          "border-primary-500": isActive,
        })}
      >
        <h1 className="mb-1">{bundle.displayName}</h1>
        <p className="text-lg font-semibold">{bundle.price}</p>
      </div>
      <div>
        <ListItem item={{ key: "CPU", value: bundle.limitCPU }} />
        <ListItem item={{ key: "内存", value: bundle.limitMemory }} />
        <ListItem item={{ key: "硬盘", value: "5 G" }} />
        <ListItem item={{ key: "数据库", value: bundle.databaseCapacity }} />
        <ListItem item={{ key: "OSS", value: bundle.storageCapacity }} />
        <ListItem item={{ key: "出网容量", value: "1Mb/s" }} />
      </div>
    </div>
  );
}
