import { useState } from "react";
import { useTranslation } from "react-i18next";
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
    <div className={clsx("flex flex-1 flex-col", colorMode === "dark" ? "" : "bg-white")}>
      <div className="flex h-12 items-center pl-16 text-lg">
        <a href="/function-templates" className="text-second">
          {t("market.funcTemplate")}
        </a>
        <span className="px-2">{`>`}</span>
        <span>{t("Template.Details")}</span>
      </div>
      {template && (
        <div className="flex px-16">
          <div className="w-10/12 pr-8">
            <Box>
              <div className="pb-2 text-xl font-semibold">{template.name}</div>
              <div className="pb-4 text-second">{template.description}</div>
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
          <div className="h-full w-2/12">
            <TemplateInfo isFromMarket={true} functionTemplate={template} usedBy={usedBy} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncTemplateItem;
