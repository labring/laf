import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import _, { find } from "lodash";

import { TextIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

import { TypeBundle } from "..";

export default function DatabaseBundleControl(props: {
  bundle: TypeBundle;
  resourceOptions: any;
  defaultDatabaseCapacity?: number;
  defaultDedicatedDatabaseBundle?: any;
  onBundleItemChange: (k: string, v?: number) => any;
}) {
  const {
    bundle,
    onBundleItemChange,
    resourceOptions,
    defaultDatabaseCapacity,
    defaultDedicatedDatabaseBundle,
  } = props;
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === COLOR_MODE.dark;
  const [databaseType, setDatabaseType] = useState<"dedicated" | "shared">(
    bundle.dedicatedDatabase ? "dedicated" : "shared",
  );

  useEffect(() => {
    if (databaseType === "dedicated") {
      onBundleItemChange("databaseCapacity", undefined);
      onBundleItemChange("dedicatedDatabase", defaultDedicatedDatabaseBundle);
    } else {
      onBundleItemChange("dedicatedDatabase", undefined);
      onBundleItemChange("databaseCapacity", defaultDatabaseCapacity);
    }
  }, [databaseType, onBundleItemChange, defaultDatabaseCapacity, defaultDedicatedDatabaseBundle]);

  const buildSlider = (props: {
    type: string;
    specs: { value: number }[];
    value?: number;
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
          <span className="text-lg font-semibold">{t("application.DatabaseSpecification")}</span>
        </div>
        <HStack>
          {(["dedicated", "shared"] as const).map((option) => (
            <div
              className={clsx("cursor-pointer rounded-md pl-4", {
                "text-[#219BF4]": databaseType === option,
              })}
              onClick={() => {
                setDatabaseType(option);
              }}
            >
              <div>
                <p className="text-lg">
                  {option === "dedicated" && t("application.DedicatedType")}
                  {option === "shared" && t("application.SharedType")}
                </p>
              </div>
            </div>
          ))}
        </HStack>
      </div>
      <div className="pb-8">
        {databaseType === "dedicated" &&
          ["cpu", "memory", "capacity"].map((type) =>
            buildSlider({
              type,
              value: _.get(bundle, `dedicatedDatabase.${type}`) as unknown as number,
              specs: find(resourceOptions, { type: `dedicatedDatabase.${type}` })?.specs || [],
              onChange: (value) => {
                onBundleItemChange(`dedicatedDatabase.${type}`, value);
              },
            }),
          )}
        {databaseType === "dedicated" && (
          <div className="ml-8 mt-8 flex items-center">
            <span className={clsx("w-[12%]", darkMode ? "" : "text-grayModern-600")}>
              {t(`SpecItem.replicas`)}
            </span>
            <NumberInput
              maxW="100px"
              size="sm"
              max={10}
              min={1}
              value={_.get(bundle, `dedicatedDatabase.replicas`)}
              onChange={(value) => {
                onBundleItemChange(`dedicatedDatabase.replicas`, Number(value));
              }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </div>
        )}
        {databaseType === "shared" &&
          buildSlider({
            type: "databaseCapacity",
            value: _.get(bundle, "databaseCapacity"),
            specs: find(resourceOptions, { type: "databaseCapacity" })?.specs || [],
            onChange: (value) => {
              onBundleItemChange("databaseCapacity", value);
            },
          })}
      </div>
    </div>
  );
}
