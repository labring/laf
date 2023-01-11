/****************************
 * cloud functions list sidebar
 ***************************/

import { useTranslation } from "react-i18next";
import { CloseIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";

import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddDepenceModal from "./AddDepenceModal";
import { TPackage, useDelPackageMutation, usePackageQuery } from "./service";

export default function DependecyList() {
  const packageQuery = usePackageQuery();
  const delPackageMutation = useDelPackageMutation();
  const { t } = useTranslation();

  return (
    <Panel className="flex-1">
      <Panel.Header title="NPM 依赖" actions={[<AddDepenceModal key="AddDepenceModal" />]} />
      <SectionList style={{ height: "200px", overflowY: "auto", overflowX: "hidden" }}>
        {packageQuery?.data?.data?.map((packageItem: TPackage) => {
          return (
            <SectionList.Item
              isActive={false}
              key={packageItem?.name!}
              onClick={() => {}}
              className="group"
            >
              <div>
                <Tooltip label={packageItem?.builtin ? "内置依赖，不可更改" : null} placement="top">
                  <span className="w-40 inline-block whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {packageItem?.name}
                  </span>
                </Tooltip>
              </div>
              <div className="text-slate-500 ">
                <span className="w-20 inline-block whitespace-nowrap overflow-hidden overflow-ellipsis">
                  {packageItem?.spec}
                </span>
                {!packageItem?.builtin ? (
                  <span className="ml-5 hidden group-hover:inline-block">
                    <Tooltip label={t("Delete").toString()} placement="top">
                      <CloseIcon
                        fontSize={10}
                        onClick={() => {
                          delPackageMutation.mutate({ name: packageItem?.name });
                        }}
                      />
                    </Tooltip>
                  </span>
                ) : null}
              </div>
            </SectionList.Item>
          );
        })}
      </SectionList>
    </Panel>
  );
}
