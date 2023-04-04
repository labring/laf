/****************************
 * cloud functions list sidebar
 ***************************/

import { useTranslation } from "react-i18next";
import { CloseIcon } from "@chakra-ui/icons";
import { Badge, Center, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import AddDependenceModal from "./AddDependenceModal";
import { TPackage, useDelPackageMutation, usePackageQuery } from "./service";

import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";

export default function DependenceList() {
  const packageQuery = usePackageQuery();
  const globalStore = useGlobalStore((state) => state);
  const delPackageMutation = useDelPackageMutation(() => {
    globalStore.updateCurrentApp(globalStore.currentApp!);
  });
  const { t } = useTranslation();

  const store = useCustomSettingStore();

  const builtinPackage: TPackage[] = [];
  const customPackage: TPackage[] = [];

  const { height } = store.getLayoutInfo("functionPage", "DependencePanel");
  const SECTION_HEIGHT = height - 90;

  packageQuery?.data?.data?.forEach((packageItem: TPackage) => {
    if (packageItem.builtin) {
      builtinPackage.push(packageItem);
    } else {
      customPackage.push(packageItem);
    }
  });

  return (
    <Panel className="min-w-[250px]">
      <Panel.Header
        title={t("FunctionPanel.Dependence")}
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
                      <FileTypeIcon type={FileType.npm} />
                      <div className="ml-2 w-[200px] overflow-hidden">
                        <span className="inline-block w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
                          {packageItem?.name}
                        </span>
                      </div>
                      <div className=" flex w-[100px]">
                        <span className="inline-block flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap">
                          {packageItem?.spec}
                        </span>
                        {!packageItem?.builtin ? (
                          <span className=" ml-2 hidden w-[10px] group-hover:inline-block">
                            <ConfirmButton
                              onSuccessAction={async () => {
                                delPackageMutation.mutate({ name: packageItem?.name });
                              }}
                              headerText={String(t("Delete"))}
                              bodyText={String(t("FunctionPanel.DeleteDependencyConfirm"))}
                            >
                              <CloseIcon fontSize={10} />
                            </ConfirmButton>
                          </span>
                        ) : null}
                      </div>
                    </SectionList.Item>
                  );
                })}
              </SectionList>
            ) : (
              <Center minH={140} className="text-grayIron-600">
                {t("FunctionPanel.CustomDependenceTip")}
              </Center>
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
                      <span className="inline-block w-40 overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {packageItem?.name}
                      </span>
                    </div>
                    <div className="inline-block w-20 overflow-hidden overflow-ellipsis whitespace-nowrap text-second">
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
