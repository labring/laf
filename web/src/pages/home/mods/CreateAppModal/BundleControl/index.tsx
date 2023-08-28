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

import { RecommendIcon, TextIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

import BundleItem from "../BundleItem";

import { TBundle } from "@/apis/typing";

export type TypeBundle = {
  cpu: number;
  memory: number;
  databaseCapacity: number;
  storageCapacity: number;
};

export default function BundleControl(props: {
  bundle: TypeBundle;
  setBundle: any;
  sortedBundles: TBundle[];
  billingResourceOptionsRes: any;
  setCalculating: any;
}) {
  const { bundle, setBundle, sortedBundles, billingResourceOptionsRes, setCalculating } = props;
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
      databaseCapacity: {
        value: bundle.databaseCapacity,
      },
      storageCapacity: {
        value: bundle.storageCapacity,
      },
    },
  });

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
          <span className="text-lg font-semibold">{t("application.ChooseSpecifications")}</span>
        </div>
        <div className="flex items-center">
          <RecommendIcon boxSize={"14px"} mr={2} color={"primary.600"} />
          <span className="">{t("application.RecommendedSpecifications")}</span>
          {(sortedBundles || []).map((item: TBundle) => {
            return (
              <BundleItem
                onChange={() => {
                  setBundle({
                    cpu: item.spec.cpu.value,
                    memory: item.spec.memory.value,
                    databaseCapacity: item.spec.databaseCapacity.value,
                    storageCapacity: item.spec.storageCapacity.value,
                  });
                  setCalculating(true);
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
        {billingResourceOptionsRes?.data?.map(
          (item: {
            type: "cpu" | "memory" | "databaseCapacity" | "storageCapacity";
            specs: { value: number; price: number }[];
            price: number;
          }) => {
            const value = item.specs.findIndex((spec) => spec.value === bundle[item.type]);
            return item.specs.length > 0 ? (
              <div className="ml-8 mt-8 flex" key={item.type}>
                <span className={clsx("w-2/12", darkMode ? "" : "text-grayModern-600")}>
                  {t(`SpecItem.${item.type}`)}
                </span>
                <Slider
                  id="slider"
                  className="mr-12"
                  value={value}
                  min={0}
                  max={item.specs.length - 1}
                  colorScheme="primary"
                  onChange={(v) => {
                    setBundle({
                      ...bundle,
                      [item.type]: item.specs[v].value,
                    });
                    setCalculating(true);
                  }}
                >
                  {item.specs.map((spec: any, i: number) => (
                    <SliderMark
                      key={spec.value}
                      value={i}
                      className={clsx(
                        "mt-2 whitespace-nowrap",
                        darkMode ? "" : "text-grayModern-600",
                      )}
                      ml={"-3"}
                    >
                      {spec.label}
                    </SliderMark>
                  ))}

                  <SliderTrack>
                    <SliderFilledTrack bg={"primary.200"} />
                  </SliderTrack>
                  {value >= 0 ? (
                    <SliderThumb bg={"primary.500"} />
                  ) : (
                    <SliderThumb
                      onClick={() => {
                        setBundle({
                          ...bundle,
                          [item.type]: item.specs[0].value,
                        });
                      }}
                      style={{ opacity: 0 }}
                    />
                  )}
                </Slider>
              </div>
            ) : null;
          },
        )}
      </div>
    </div>
  );
}
