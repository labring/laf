import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button } from "@chakra-ui/react";
import clsx from "clsx";

import { FilledHeartIcon, HeartIcon } from "@/components/CommonIcon";

import { useFunctionTemplateStarMutation, useGetStarStateQuery } from "../../../service";

import UseTemplateModal from "./UseTemplateModal";

import { TFunctionTemplate } from "@/apis/typing";

const UseTemplate = ({ template }: { template: TFunctionTemplate }) => {
  const { star, _id: templateId, dependencies } = template;

  const { t } = useTranslation();
  const [starState, setStarState] = useState(false);
  const [starNum, setStarNum] = useState(star);
  const starMutation = useFunctionTemplateStarMutation();

  useGetStarStateQuery(
    { id: templateId },
    {
      onSuccess: (data: any) => {
        setStarState(data.data === "stared");
      },
    },
  );

  return (
    <Box className="flex justify-end pb-8">
      <button
        className={clsx(
          "mr-4 flex h-9 cursor-pointer items-center rounded-3xl border px-3 text-xl",
          starState ? "border-rose-500 text-rose-500" : "text-gray-400",
        )}
        onClick={async () => {
          const res = await starMutation.mutateAsync({ templateId: templateId || "" });
          if (!res.error) {
            if (starState) {
              setStarState(false);
              setStarNum(starNum - 1);
            } else if (starNum >= 0) {
              setStarState(true);
              setStarNum(starNum + 1);
            }
          }
        }}
      >
        {starState ? <FilledHeartIcon /> : <HeartIcon />}
        <span className="pl-1">{starNum}</span>
      </button>
      <UseTemplateModal templateId={templateId || ""} packageList={dependencies}>
        <Button height={9}>{t("Template.useTemplate")}</Button>
      </UseTemplateModal>
    </Box>
  );
};

export default UseTemplate;
