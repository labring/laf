import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Text } from "@chakra-ui/react";
import { t } from "i18next";

import JsonEditor from "@/components/Editor/JsonEditor";
import Panel from "@/components/Panel";

import AddRulesModal from "../mods/AddRulesModal";
import policyTemplate from "../mods/AddRulesModal/policyTemplate";
import RightPanelEditBox from "../RightComponent/EditBox";
import RightPanelList from "../RightComponent/List";
import { useDeleteRuleMutation, useRulesListQuery, useUpdateRulesMutation } from "../service";

import useGlobalStore from "@/pages/globalStore";

export default function PolicyDataList() {
  const [currentData, setCurrentData] = useState<any>(undefined);
  const [record, setRecord] = useState(JSON.stringify(policyTemplate));
  const globalStore = useGlobalStore();
  const rulesListQuery = useRulesListQuery((data: any) => {
    if (data?.data.length === 0) {
      setCurrentData(undefined);
    } else {
      setCurrentData(data.data[0]);
    }
  });
  const deleteRuleMutation = useDeleteRuleMutation(() => {
    setCurrentData(undefined);
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

  return (
    <>
      <Panel.Header className="w-full pr-2 h-[60px] flex-shrink-0">
        <AddRulesModal
          onSuccessSubmit={(data) => {
            rulesListQuery.refetch();
          }}
        />
        <span>
          {t("CollectionPanel.RulesNum")}:{rulesListQuery?.data?.data?.length || 0}
        </span>
      </Panel.Header>
      <div className="w-full flex-grow flex overflow-hidden">
        <RightPanelList
          ListQuery={rulesListQuery?.data?.data}
          setKey="id"
          isActive={(item: any) => currentData?.id === item.id}
          onClick={(data: any) => {
            setCurrentData(data);
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
          <div className=" flex-1">
            <JsonEditor
              value={JSON.stringify(currentData?.value || policyTemplate, null, 2)}
              onChange={(values) => {
                setRecord(values!);
              }}
            />
          </div>
        </RightPanelEditBox>
      </div>
    </>
  );
}
