import { useEffect, useState } from "react";
import { AddIcon, CopyIcon } from "@chakra-ui/icons";
import { Button, Center, Spinner, Text, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import JsonEditor from "@/components/Editor/JsonEditor";
import JSONViewer from "@/components/Editor/JSONViewer";
import EmptyBox from "@/components/EmptyBox";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";

import AddPolicyModal from "../mods/AddPolicyModal";
import AddRulesModal from "../mods/AddRulesModal";
import policyTemplate from "../mods/AddRulesModal/policyTemplate";
import RightPanelEditBox from "../RightComponent/EditBox";
import RightPanelList from "../RightComponent/List";
import { useDeleteRuleMutation, useRulesListQuery, useUpdateRulesMutation } from "../service";
import useDBMStore from "../store";

import useGlobalStore from "@/pages/globalStore";

export default function PolicyDataList() {
  const [currentData, setCurrentData] = useState<any>(undefined);
  const [record, setRecord] = useState(JSON.stringify(policyTemplate, null, 2));
  const globalStore = useGlobalStore();
  const store = useDBMStore((state) => state);
  const rulesListQuery = useRulesListQuery((data: any) => {
    if (data?.data.length === 0) {
      setCurrentData(undefined);
    } else if (currentData === undefined) {
      setCurrentData(data.data[0]);
      setRecord(JSON.stringify(data.data[0].value, null, 2));
    }
  });

  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  useEffect(() => {
    setCurrentData(undefined);
    setRecord(JSON.stringify(policyTemplate, null, 2));
  }, [store.currentPolicy, setCurrentData]);

  const deleteRuleMutation = useDeleteRuleMutation(() => {
    setCurrentData(undefined);
    setRecord(JSON.stringify(policyTemplate, null, 2));
    rulesListQuery.refetch();
  });
  const updateRulesMutation = useUpdateRulesMutation((data) => {
    rulesListQuery.refetch();
  });

  const handleData = async () => {
    try {
      JSON.parse(record);
      await updateRulesMutation.mutateAsync({
        collection: currentData.collectionName,
        value: record,
      });
      rulesListQuery.refetch();
    } catch (error) {
      globalStore.showError(error?.toString());
    }
  };

  if (store.currentPolicy === undefined) {
    return (
      <Center className="h-full">
        <EmptyBox>
          <div>
            {t("CollectionPanel.EmptyPolicyText")}
            <AddPolicyModal>
              <span className="ml-2 cursor-pointer text-primary-600 hover:border-b-2 hover:border-primary-600">
                {t("CreateNow")}
              </span>
            </AddPolicyModal>
          </div>
        </EmptyBox>
      </Center>
    );
  }

  return (
    <>
      <Panel.Header className="h-[60px] w-full flex-shrink-0 pr-2">
        <AddRulesModal
          onSuccessSubmit={(data) => {
            setCurrentData(data);
            setRecord(JSON.stringify(data?.value, null, 2));
            rulesListQuery.refetch();
          }}
        >
          <Button
            disabled={store.currentPolicy === undefined}
            colorScheme="primary"
            className="mr-2"
            style={{ width: "114px" }}
            leftIcon={<AddIcon />}
          >
            {t("CollectionPanel.AddRules")}
          </Button>
        </AddRulesModal>
        <span>
          {t("CollectionPanel.RulesNum")} : {rulesListQuery?.data?.data?.length || 0}
        </span>
      </Panel.Header>
      <div className="flex w-full flex-grow overflow-hidden">
        {rulesListQuery.isFetching ? (
          <Center className="bg-white-200 h-full w-full opacity-60">
            <Spinner size="lg" />
          </Center>
        ) : rulesListQuery?.data?.data.length ? (
          <>
            <RightPanelList
              ListQuery={rulesListQuery?.data?.data}
              setKey="id"
              isActive={(item: any) => currentData?.id === item.id}
              onClick={(data: any) => {
                setCurrentData(data);
                setRecord(JSON.stringify(data.value, null, 2));
              }}
              deleteRuleMutation={deleteRuleMutation}
              deleteData={(item) => ({ collection: item.collectionName })}
              component={(item: any) => {
                return (
                  <>
                    <div
                      className={clsx("mb-4 border-b-2 p-2", {
                        "border-lafWhite-600": !darkMode,
                      })}
                    >
                      <Text fontSize="md" className="font-semibold leading-loose">
                        {t("CollectionPanel.Collection")}:{item.collectionName}
                      </Text>
                    </div>
                    <JSONViewer colorMode={colorMode} code={JSON.stringify(item.value, null, 2)} />
                  </>
                );
              }}
              toolComponent={(item: any) => {
                return (
                  <IconWrap
                    showBg
                    tooltip={t("Copy").toString()}
                    size={32}
                    className="group/icon ml-2 hover:bg-rose-100"
                  >
                    <CopyText
                      hideToolTip
                      text={JSON.stringify(item.value, null, 2)}
                      tip={String(t("Copied"))}
                      className="group-hover/icon:text-error-500"
                    >
                      <CopyIcon />
                    </CopyText>
                  </IconWrap>
                );
              }}
            />
            <RightPanelEditBox
              show={currentData?.id}
              title={t("Edit")}
              isLoading={updateRulesMutation.isLoading}
              onSave={handleData}
            >
              <Text fontSize="md" className="mb-2 font-semibold leading-loose">
                {t("CollectionPanel.SelectCollection")}: {currentData?.collectionName}
              </Text>
              <Text fontSize="md" className="mb-2 mt-4 font-semibold leading-loose">
                {t("CollectionPanel.RulesContent")}
              </Text>
              <div
                className={clsx(" mb-4 flex-1 rounded pr-2", {
                  "bg-lafWhite-400": !darkMode,
                  "bg-lafDark-200": darkMode,
                })}
              >
                <JsonEditor
                  colorMode={colorMode}
                  value={record}
                  onChange={(values) => {
                    setRecord(values!);
                  }}
                />
              </div>
            </RightPanelEditBox>
          </>
        ) : (
          <EmptyBox>
            <div>
              <span>{t("CollectionPanel.EmptyRuleTip")}</span>
              <AddRulesModal
                onSuccessSubmit={(data) => {
                  setCurrentData(data);
                  setRecord(JSON.stringify(data.value, null, 2));
                  rulesListQuery.refetch();
                }}
              >
                <span className="ml-2 cursor-pointer text-primary-600 hover:border-b-2 hover:border-primary-600">
                  {t("CreateNow")}
                </span>
              </AddRulesModal>
            </div>
          </EmptyBox>
        )}
      </div>
    </>
  );
}
