/****************************
 * cloud functions list sidebar
 ***************************/

import { useTranslation } from "react-i18next";
import { CloseIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddDepenceModal from "./AddDepenceModal";
import EditDepenceModal from "./EditDepenceModal";
import { TPackage, useDelPackageMutation, usePackageQuery } from "./service";

export default function DependecyList() {
  const packageQuery = usePackageQuery();
  const delPackageMutation = useDelPackageMutation();
  const { t } = useTranslation();

  return (
    <div>
      <Panel
        title="NPM 依赖"
        actions={[
          <AddDepenceModal key="AddDepenceModal" packageList={packageQuery?.data?.data} />,
          <EditDepenceModal key="EditDepenceModal" packageList={packageQuery?.data?.data} />,
        ]}
      >
        <SectionList style={{ height: "200px", overflowY: "auto" }}>
          {packageQuery?.data?.data?.map((packageItem: TPackage) => {
            return (
              <SectionList.Item
                isActive={false}
                key={packageItem?.name!}
                onClick={() => {}}
                className="group"
              >
                <div>
                  <FileTypeIcon type={FileType.npm} />
                  <span className="ml-2">{packageItem?.name}</span>
                </div>
                <div className="text-slate-500 ">
                  {packageItem?.spec && packageItem.spec.length > 10
                    ? packageItem.spec.slice(0, 10) + "..."
                    : packageItem?.spec}
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
                </div>
              </SectionList.Item>
            );
          })}
        </SectionList>
      </Panel>
    </div>
  );
}
