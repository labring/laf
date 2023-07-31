import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import TemplateInfo from "../Mods/TemplateInfo";
import { useGetFunctionTemplateUsedByQuery, useGetOneFunctionTemplateQuery } from "../service";

import TemplateFunctionInfo from "./TemplateFunctionInfo";

import { TFunctionTemplate } from "@/apis/typing";

const FuncTemplateItem = (props: { isModal: boolean }) => {
  const { isModal } = props;
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<TFunctionTemplate>();
  const [usedBy, setUsedBy] = useState();
  const pathname = window.location.href;
  const id = pathname.split("/").pop();

  useGetOneFunctionTemplateQuery(
    { id: id },
    {
      enabled: (id as string)?.length > 12,
      onSuccess: (data: any) => {
        setTemplate(data.data[0]);
      },
    },
  );

  useGetFunctionTemplateUsedByQuery(
    { id: id },
    {
      enabled: (id as string)?.length > 12,
      onSuccess: (data: any) => {
        setUsedBy(data.data);
      },
    },
  );

  return (
    <div
      className={clsx(
        "flex flex-col",
        colorMode === "dark" ? "" : "bg-white",
        isModal ? "" : "px-20 pt-8",
      )}
    >
      <div className="text-lg">
        <span
          className="cursor-pointer text-second"
          onClick={() => {
            navigate(-1);
          }}
        >
          {t("HomePage.NavBar.funcTemplate")}
        </span>
        <span className="px-3">
          <ChevronRightIcon />
        </span>
        <span>{t("Template.Details")}</span>
      </div>
      {template && (
        <div className="flex pt-3">
          <div className="mr-9 h-full w-4/5">
            <TemplateFunctionInfo template={template} />
          </div>
          <div className="w-1/5">
            <TemplateInfo functionTemplate={template} usedBy={usedBy} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncTemplateItem;
