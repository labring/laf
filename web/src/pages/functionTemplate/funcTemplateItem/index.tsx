import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import TemplateInfo from "../Mods/TemplateInfo";
import { useGetFunctionTemplateUsedByQuery, useGetOneFunctionTemplateQuery } from "../service";

import { TFunctionTemplate } from "@/apis/typing";
import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";

const FuncTemplateItem = (props: { setSelectedItem: any; selectedItem: any }) => {
  const { setSelectedItem } = props;
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<TFunctionTemplate>();
  const [currentFunction, setCurrentFunction] = useState<any>();
  const [usedBy, setUsedBy] = useState<any[]>([]);
  const pathname = window.location.href;
  const id = pathname.split("/").pop();

  useGetOneFunctionTemplateQuery(
    { id: id },
    {
      enabled: (id as string)?.length > 12,
      onSuccess: (data: any) => {
        setTemplate(data.data[0]);
        setCurrentFunction(data.data[0].items[0]);
      },
    },
  );

  useGetFunctionTemplateUsedByQuery(
    { id: id },
    {
      enabled: (id as string)?.length > 12,
      onSuccess: (data: any) => {
        setUsedBy(data.data.list);
      },
    },
  );

  return (
    <div className={clsx("flex flex-col px-20", colorMode === "dark" ? "" : "bg-white")}>
      <div className="pt-8 text-lg">
        <span
          className="cursor-pointer text-second"
          onClick={() => {
            const currentURL = window.location.pathname;
            const lastIndex = currentURL.lastIndexOf("/");
            const newURL = currentURL.substring(0, lastIndex) + `/recommended`;
            navigate(newURL);
            setSelectedItem({ text: t("Template.Recommended"), value: "recommended" });
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
            <div className="pb-2 text-xl font-semibold">{template.name}</div>
            <div className="pb-6 text-second">{template.description}</div>
            <div className="mb-2 flex w-full overflow-auto">
              {template.items.map((item) => {
                return (
                  <div
                    className={clsx(
                      "mb-2 mr-2 cursor-pointer rounded-md border bg-[#F6F8F9] px-8 py-1 text-[14px]",
                      "hover:border-blue-400 hover:bg-blue-100 hover:text-blue-700",
                      currentFunction.name === item.name
                        ? "border-blue-400 bg-blue-100 text-blue-700"
                        : "",
                    )}
                    onClick={() => {
                      setCurrentFunction(item);
                    }}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
            <div className="h-[60vh] overflow-auto">
              <MonacoEditor
                value={currentFunction.source.code}
                colorMode={colorMode}
                readOnly={true}
                title={currentFunction.name}
                currentFunction={currentFunction}
              />
            </div>
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
