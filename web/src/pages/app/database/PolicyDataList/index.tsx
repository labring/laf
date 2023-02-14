import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon, CopyIcon } from "@chakra-ui/icons";
import { Button, Center, Spinner, Text } from "@chakra-ui/react";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import JsonEditor from "@/components/Editor/JsonEditor";
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
              <span className="ml-2 text-primary-600 hover:border-b-2 hover:border-primary-600 cursor-pointer">
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
      <Panel.Header className="w-full pr-2 h-[60px] flex-shrink-0">
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
      <div className="w-full flex-grow flex overflow-hidden">
        {rulesListQuery.isFetching ? (
          <Center className="h-full w-full opacity-60 bg-white-200">
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
                    <div className="border-b-2 border-lafWhite-600 mb-4 p-2">
                      <Text fontSize="md" className="leading-loose font-semibold">
                        {t("CollectionPanel.Collection")}:{item.collectionName}
                      </Text>
                    </div>
                    <SyntaxHighlighter language="json" customStyle={{ background: "#fdfdfe" }}>
                      {JSON.stringify(item.value, null, 2)}
                    </SyntaxHighlighter>
                  </>
                );
              }}
              toolComponent={(item: any) => {
                return (
                  <IconWrap
                    showBg
                    tooltip={t("Copy").toString()}
                    size={32}
                    className="ml-2 hover:bg-rose-100 group/icon"
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
              <Text fontSize="md" className="leading-loose font-semibold mb-2">
                {t("CollectionPanel.SelectCollection")}: {currentData?.collectionName}
              </Text>
              <Text fontSize="md" className="leading-loose font-semibold mt-4 mb-2">
                {t("CollectionPanel.RulesContent")}
              </Text>
              <div className=" mb-4 pr-2 flex-1 bg-lafWhite-400 rounded">
                <JsonEditor
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
                <span className="ml-2 text-primary-600 hover:border-b-2 hover:border-primary-600 cursor-pointer">
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
