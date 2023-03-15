import React from "react";
import clsx from "clsx";
import { t } from "i18next";

import {
  formatLimitCapacity,
  formatLimitCPU,
  formatLimitMemory,
  formatLimitTraffic,
  formatPrice,
} from "@/utils/format";

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
      onClick={() => onChange(bundle.id)}
      key={bundle.name}
      className={clsx("min-w-[170px] border p-2 rounded-md cursor-pointer", {
        "border-primary-500 bg-primary-100": isActive,
      })}
    >
      <div
        className={clsx("pb-2 border-b mb-2", {
          "border-primary-500": isActive,
        })}
      >
        <h1 className="mb-1">{bundle.displayName}</h1>
        <p className="text-xl font-semibold">
          {bundle.subscriptionOptions[0].price === 0
            ? t("Price.Free")
            : formatPrice(bundle.subscriptionOptions[0].price)}
        </p>
      </div>
      <div>
        <ListItem
          item={{
            key: "CPU",
            value: `${formatLimitCPU(bundle.resource.limitCPU)} ${t("Unit.CPU")}`,
          }}
        />
        <ListItem
          item={{
            key: t("Spec.RAM"),
            value: `${formatLimitMemory(bundle.resource.limitMemory)} ${t("Unit.MB")}`,
          }}
        />
        <ListItem
          item={{
            key: t("Spec.Database"),
            value: `${formatLimitCapacity(bundle.resource.databaseCapacity)} ${t("Unit.GB")}`,
          }}
        />
        <ListItem
          item={{
            key: t("Spec.Storage"),
            value: `${formatLimitCapacity(bundle.resource.storageCapacity)} ${t("Unit.GB")}`,
          }}
        />
        <ListItem
          item={{
            key: t("Spec.NetworkTraffic"),
            value: `${formatLimitTraffic(bundle.resource.networkTrafficOutbound)} ${t("Unit.GB")}`,
          }}
        />
      </div>
    </div>
  );
}
