import { useTranslation } from "react-i18next";
import {
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { find } from "lodash";
import _ from "lodash";

import { RecommendIcon, TextIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

import BundleItem from "../BundleItem";
import { TypeBundle } from "..";

import { TBundle } from "@/apis/typing";

export default function BundleControl(props: {
  bundle: TypeBundle;
  type: "create" | "change";
  sortedBundles: TBundle[];
  onBundleItemChange: (k: string, v?: number) => any;
  resourceOptions: any;
}) {
  const { bundle, onBundleItemChange, resourceOptions, sortedBundles, type } = props;
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === COLOR_MODE.dark;

  const activeBundle = find(sortedBundles, {
    spec: {
      cpu: {
        value: bundle.cpu,
      },
      memory: {
        value: bundle.memory,
      },
      storageCapacity: {
        value: bundle.storageCapacity,
      },
    },
  });

  const buildSlider = (props: {
    type: string;
    specs: { value: number }[];
    value: number;
    onChange: (value: number) => void;
  }) => {
    const { type, specs, value, onChange } = props;
    const idx = specs.findIndex((spec) => spec.value === value);

    return (
      <div className="ml-8 mt-8 flex" key={type}>
        <span className={clsx("w-2/12", darkMode ? "" : "text-grayModern-600")}>
          {t(`SpecItem.${type}`)}
        </span>
        <Slider
          id="slider"
          className="mr-12"
          value={idx}
          min={0}
          max={specs.length - 1}
          colorScheme="primary"
          onChange={(v) => {
            onChange(specs[v].value);
          }}
        >
          {specs.map((spec: any, i: number) => (
            <SliderMark
              key={spec.value}
              value={i}
              className={clsx("mt-2 whitespace-nowrap", darkMode ? "" : "text-grayModern-600")}
              ml={"-3"}
            >
              {spec.label}
            </SliderMark>
          ))}

          <SliderTrack>
            <SliderFilledTrack bg={"primary.200"} />
          </SliderTrack>
          {idx >= 0 ? (
            <SliderThumb bg={"primary.500"} />
          ) : (
            <SliderThumb
              onClick={() => {
                onChange(specs[0].value);
              }}
              style={{ opacity: 0 }}
            />
          )}
        </Slider>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 rounded-md border">
      <div
        className={clsx(
          "flex items-center justify-between px-8 py-3.5",
          darkMode ? "" : "bg-[#F6F8F9]",
        )}
      >
        <div className="flex items-center">
          <TextIcon boxSize={4} mr={2} color={darkMode ? "" : "grayModern.600"} />
          <span className="text-lg font-semibold">{t("application.ApplicationSecification")}</span>
        </div>
        <div className="flex items-center">
          <RecommendIcon boxSize={"14px"} mr={2} color={"primary.600"} />
          <span className="">{t("application.RecommendedSpecifications")}</span>
          {(sortedBundles || []).map((item: TBundle) => {
            return (
              <BundleItem
                onChange={() => {
                  onBundleItemChange("cpu", item.spec.cpu.value);
                  onBundleItemChange("memory", item.spec.memory.value);
                  onBundleItemChange("storageCapacity", item.spec.storageCapacity.value);
                  if (bundle.dedicatedDatabase) {
                    onBundleItemChange(
                      "dedicatedDatabase.cpu",
                      item.spec.dedicatedDatabaseCPU.value,
                    );
                    onBundleItemChange(
                      "dedicatedDatabase.memory",
                      item.spec.dedicatedDatabaseMemory.value,
                    );
                    if (type !== "change") {
                      onBundleItemChange(
                        "dedicatedDatabase.capacity",
                        item.spec.dedicatedDatabaseCapacity.value,
                      );
                      onBundleItemChange(
                        "dedicatedDatabase.replicas",
                        item.spec.dedicatedDatabaseReplicas.value,
                      );
                    }
                  } else {
                    onBundleItemChange("databaseCapacity", item.spec.databaseCapacity.value);
                  }
                }}
                bundle={item}
                isActive={activeBundle?._id === item._id}
                key={item._id}
              />
            );
          })}
        </div>
      </div>
      <div className="pb-8">
        {["cpu", "memory", "storageCapacity"].map((type) =>
          buildSlider({
            type,
            value: _.get(bundle, type),
            specs: find(resourceOptions, { type })?.specs || [],
            onChange: (value) => {
              onBundleItemChange(type, value);
            },
          }),
        )}
      </div>
    </div>
  );
}
