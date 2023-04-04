import { useColorMode } from "@chakra-ui/react";
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
    <div className="mb-1 flex justify-between text-second">
      <div>{item.key}</div>
      <div>{item.value}</div>
    </div>
  );
};

export default function BundleItem(props: {
  onChange: (...event: any[]) => void;
  bundle: TBundle;
  durationIndex: number;
  isActive: boolean;
}) {
  const { bundle, isActive, onChange } = props;
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  let durationIndex = props.durationIndex;
  if (durationIndex < 0) {
    durationIndex = 0;
  }

  const months = bundle.subscriptionOptions[durationIndex].duration / (60 * 60 * 24 * 31);

  return (
    <div
      onClick={() => onChange(bundle.id)}
      key={bundle.name}
      className={clsx("min-w-[170px] cursor-pointer rounded-md border p-2", {
        "border-primary-500 bg-lafWhite-400": isActive && !darkMode,
        "bg-lafDark-400": isActive && darkMode,
      })}
    >
      <div
        className={clsx("mb-2 border-b pb-2", {
          "border-primary-500": isActive,
        })}
      >
        <h1 className="mb-1">{bundle.displayName}</h1>
        <p className="text-2xl font-semibold">
          {bundle.subscriptionOptions[durationIndex].specialPrice === 0 ? (
            t("Price.Free")
          ) : (
            <>
              {formatPrice(bundle.subscriptionOptions[durationIndex].specialPrice / months)}
              <span className="ml-1 text-base">/ {t("Monthly")}</span>
            </>
          )}
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
