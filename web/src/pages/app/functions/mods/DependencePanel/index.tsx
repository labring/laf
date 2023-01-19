/****************************
 * cloud functions list sidebar
 ***************************/

import { useTranslation } from "react-i18next";
import { CloseIcon } from "@chakra-ui/icons";
import { Badge, Center, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip } from "@chakra-ui/react";

import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddDependenceModal from "./AddDependenceModal";
import { TPackage, useDelPackageMutation, usePackageQuery } from "./service";

export default function DependenceList() {
  const packageQuery = usePackageQuery();
  const delPackageMutation = useDelPackageMutation();
  const { t } = useTranslation();

  const builtinPackage: TPackage[] = [];
  const customPackage: TPackage[] = [];

  const SECTION_HEIGHT = 180;

  packageQuery?.data?.data?.forEach((packageItem: TPackage) => {
    if (packageItem.builtin) {
      builtinPackage.push(packageItem);
    } else {
      customPackage.push(packageItem);
    }
  });

  return (
    <Panel>
      <Panel.Header
        title={"NPM " + t("FunctionPanel.Dependence")}
        actions={[<AddDependenceModal key="AddDependenceModal" />]}
      />
      <Tabs variant="soft-rounded" colorScheme={"gray"} size={"sm"}>
        <TabList>
          <Tab>
            {t("FunctionPanel.CustomDependence")}
            {customPackage.length > 0 && (
              <Badge rounded={"full"} ml="1">
                {customPackage.length}
              </Badge>
            )}
          </Tab>
          <Tab>
            {t("FunctionPanel.SystemDependence")}
            <Badge rounded={"full"} ml="1">
              {builtinPackage.length}
            </Badge>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0} py={1}>
            {customPackage.length > 0 ? (
              <SectionList
                style={{ height: SECTION_HEIGHT, overflowY: "auto", overflowX: "hidden" }}
              >
                {customPackage.map((packageItem: TPackage) => {
                  return (
                    <SectionList.Item
                      size="small"
                      isActive={false}
                      key={packageItem?.name!}
                      onClick={() => {}}
                      className="group"
                    >
                      <div className="w-[200px] overflow-hidden">
                        <Tooltip
                          label={packageItem?.builtin ? "内置依赖，不可更改" : null}
                          placement="top"
                        >
                          <span className="w-full inline-block whitespace-nowrap overflow-hidden overflow-ellipsis">
                            {packageItem?.name}
                          </span>
                        </Tooltip>
                      </div>
                      <div className=" w-[100px] flex">
                        <span className="flex-grow inline-block whitespace-nowrap overflow-hidden overflow-ellipsis">
                          {packageItem?.spec}
                        </span>
                        {!packageItem?.builtin ? (
                          <span className=" w-[10px] ml-2 hidden group-hover:inline-block">
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
            ) : (
              <Center minH={140}>{t("FunctionPanel.CustomDependenceTip")}</Center>
            )}
          </TabPanel>
          <TabPanel px={0} py={1}>
            {/* build in packages */}
            <SectionList style={{ height: SECTION_HEIGHT, overflowY: "auto", overflowX: "hidden" }}>
              {builtinPackage.map((packageItem: TPackage) => {
                return (
                  <SectionList.Item
                    size="small"
                    isActive={false}
                    key={packageItem?.name!}
                    className="group"
                  >
                    <div className=" text-second">
                      <span className="w-40 inline-block whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {packageItem?.name}
                      </span>
                    </div>
                    <div className="text-second w-20 inline-block whitespace-nowrap overflow-hidden overflow-ellipsis">
                      <span>{packageItem?.spec}</span>
                    </div>
                  </SectionList.Item>
                );
              })}
            </SectionList>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Panel>
  );
}
