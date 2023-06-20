import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import TemplateInfo from "../Mods/TemplateInfo";
import { useGetFunctionTemplateUsedByQuery, useGetOneFunctionTemplateQuery } from "../service";

import { TFunctionTemplate } from "@/apis/typing";
import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";

const FuncTemplateItem = () => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();

  const [template, setTemplate] = useState<TFunctionTemplate>();
  const [usedBy, setUsedBy] = useState<any[]>([]);
  const pathname = window.location.href;
  const id = pathname.split("/").pop();

  useGetOneFunctionTemplateQuery(
    { id: id },
    {
      onSuccess: (data: any) => {
        setTemplate(data.data[0]);
      },
    },
  );

  useGetFunctionTemplateUsedByQuery(
    { id: id },
    {
      onSuccess: (data: any) => {
        setUsedBy(data.data.list);
      },
    },
  );

  return (
    <div className={clsx("flex flex-col px-20", colorMode === "dark" ? "" : "bg-white")}>
      <div className="pt-8 text-lg">
        <a href="/market/templates/all" className="text-second">
          {t("market.funcTemplate")}
        </a>
        <span className="px-3">
          <ChevronRightIcon />
        </span>
        <span>{t("Template.Details")}</span>
      </div>
      {template && (
        <div className="flex pt-3">
          <div className="mr-9 w-4/5">
            <Box>
              <div className="pb-2 text-xl font-semibold">{template.name}</div>
              <div className="pb-6 text-second">{template.description}</div>
              {(template.items || []).map((item) => {
                return (
                  <div key={item.name} className="mb-4 h-[60vh]">
                    <MonacoEditor
                      value={item.source.code}
                      colorMode={colorMode}
                      readOnly={true}
                      title={item.name}
                    />
                  </div>
                );
              })}
            </Box>
          </div>
          <div className="h-full w-1/5">
            <TemplateInfo functionTemplate={template} usedBy={usedBy} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncTemplateItem;
