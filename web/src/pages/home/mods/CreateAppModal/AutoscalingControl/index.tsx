import { useTranslation } from "react-i18next";
import {
  Collapse,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderMark,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  Switch,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";

import { AutoScalingIcon } from "@/components/CommonIcon";

export type TypeAutoscaling = {
  enable: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetCPUUtilizationPercentage: number | null;
  targetMemoryUtilizationPercentage: number | null;
};

export default function AutoScalingControl(props: {
  autoscaling: TypeAutoscaling;
  setAutoscaling: any;
  className?: string;
}) {
  const { autoscaling, setAutoscaling, className } = props;
  const darkMode = useColorMode().colorMode === "dark";
  const { t } = useTranslation();

  return (
    <div className={clsx("w-full rounded-md border", className)}>
      <div className={clsx("flex justify-between px-8 py-3.5", darkMode ? "" : "bg-[#F6F8F9]")}>
        <div className="flex items-center">
          <AutoScalingIcon mr={2} boxSize={"14px"} color={darkMode ? "" : "grayModern.600"} />
          <span className="text-lg font-semibold">{t("application.autoscaling")}</span>
        </div>
        <Switch
          id="email-alerts"
          defaultChecked={autoscaling.enable}
          colorScheme="primary"
          onChange={() => {
            if (autoscaling.enable) {
              setAutoscaling({
                ...autoscaling,
                enable: !autoscaling.enable,
              });
            } else {
              setAutoscaling({
                ...autoscaling,
                enable: !autoscaling.enable,
                targetCPUUtilizationPercentage: 50,
                targetMemoryUtilizationPercentage: null,
              });
            }
          }}
        />
      </div>
      <Collapse in={autoscaling.enable} animateOpacity>
        <div className="flex px-8 pt-8">
          <span className={clsx("w-2/12", darkMode ? "" : "text-grayModern-600")}>
            {t("application.Number of Instances")}
          </span>
          <RangeSlider
            defaultValue={[autoscaling.minReplicas, autoscaling.maxReplicas]}
            min={1}
            max={20}
            colorScheme="primary"
            onChange={(v) => {
              setAutoscaling({
                ...autoscaling,
                minReplicas: v[0],
                maxReplicas: v[1],
              });
            }}
          >
            {[1, 10, 20].map((value) => (
              <RangeSliderMark
                value={value}
                className={clsx("mt-2 whitespace-nowrap", darkMode ? "" : "text-grayModern-600")}
                ml={"-1.5"}
                key={value}
              >
                {value}
              </RangeSliderMark>
            ))}
            <RangeSliderTrack>
              <RangeSliderFilledTrack bg={"primary.200"} />
            </RangeSliderTrack>
            <Tooltip
              hasArrow
              label={String(autoscaling.minReplicas)}
              placement="top"
              bg={"primary.500"}
            >
              <RangeSliderThumb bg={"primary.500"} index={0} />
            </Tooltip>
            <Tooltip
              hasArrow
              label={String(autoscaling.maxReplicas)}
              placement="top"
              bg={"primary.500"}
            >
              <RangeSliderThumb bg={"primary.500"} index={1} />
            </Tooltip>
          </RangeSlider>
        </div>
        <div className="flex items-center pb-8 pt-6">
          <div className="ml-8 mr-4 flex w-24">
            <Select
              onChange={(e) => {
                if (e.target.value === t("Storage Threshold")) {
                  setAutoscaling({
                    ...autoscaling,
                    targetCPUUtilizationPercentage: null,
                    targetMemoryUtilizationPercentage: 50,
                  });
                } else {
                  setAutoscaling({
                    ...autoscaling,
                    targetCPUUtilizationPercentage: 50,
                    targetMemoryUtilizationPercentage: null,
                  });
                }
              }}
              defaultValue={
                autoscaling.targetCPUUtilizationPercentage
                  ? String(t("application.CPU Threshold"))
                  : String(t("Storage Threshold"))
              }
              className={clsx(
                "!h-8 !border-none !px-2 !text-[12px]",
                darkMode ? "" : "!bg-[#F4F6F8]",
              )}
            >
              <option className="">{t("application.CPU Threshold")}</option>
              <option>{t("Storage Threshold")}</option>
            </Select>
          </div>
          <Input
            value={
              autoscaling.targetCPUUtilizationPercentage
                ? (autoscaling.targetCPUUtilizationPercentage as number)
                : (autoscaling.targetMemoryUtilizationPercentage as number)
            }
            className="!h-8 !w-20"
            onChange={(e) => {
              if (autoscaling.targetCPUUtilizationPercentage) {
                setAutoscaling({
                  ...autoscaling,
                  targetCPUUtilizationPercentage: Number(e.target.value),
                  targetMemoryUtilizationPercentage: null,
                });
              } else {
                setAutoscaling({
                  ...autoscaling,
                  targetCPUUtilizationPercentage: null,
                  targetMemoryUtilizationPercentage: Number(e.target.value),
                });
              }
            }}
          />
          <span className="pl-2">%</span>
        </div>
      </Collapse>
    </div>
  );
}
