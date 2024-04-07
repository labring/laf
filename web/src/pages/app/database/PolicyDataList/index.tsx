import { useEffect, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Center, Input, Spinner, Text, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { OutlineCopyIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import JSONEditor from "@/components/Editor/JSONEditor";
import JSONViewer from "@/components/Editor/JSONViewer";
import EmptyBox from "@/components/EmptyBox";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import { COLOR_MODE } from "@/constants";

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
  const darkMode = colorMode === COLOR_MODE.dark;

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
            leftIcon={<AddIcon fontSize={10} className="text-grayModern-500" />}
            variant="textGhost"
            size="xs"
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
              setKey="_id"
              isActive={(item: any) => currentData?._id === item._id}
              customStyle={{
                "border-lafWhite-600": colorMode === COLOR_MODE.light,
              }}
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
                      className={clsx("mb-4 border-b-2 pb-2 pl-2", {
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
                  <CopyText
                    hideToolTip
                    text={JSON.stringify(item.value, null, 2)}
                    tip={String(t("Copied"))}
                    className="ml-2 hover:bg-gray-200"
                  >
                    <IconWrap
                      showBg
                      tooltip={t("Copy").toString()}
                      size={32}
                      className="group/icon"
                    >
                      <OutlineCopyIcon size="14" color={darkMode ? "#ffffff" : "#24282C"} />
                    </IconWrap>
                  </CopyText>
                );
              }}
            />
            <RightPanelEditBox
              show={currentData?._id}
              title={t("Edit")}
              isLoading={updateRulesMutation.isLoading}
              onSave={handleData}
            >
              <Text fontSize="md" className="mb-2 font-semibold leading-loose">
                {t("CollectionPanel.SelectCollection")}:
              </Text>
              <Input
                isDisabled
                value={currentData?.collectionName}
                className={darkMode ? "bg-lafDark-200" : "bg-lafWhite-400"}
              ></Input>
              <Text fontSize="md" className="mb-2 mt-4 font-semibold leading-loose">
                {t("CollectionPanel.RulesContent")}
              </Text>
              <div
                className={clsx(" mb-4 flex-1 rounded pr-2", {
                  "bg-lafWhite-400": !darkMode,
                  "bg-lafDark-200": darkMode,
                })}
              >
                <JSONEditor
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
            </div>
          </EmptyBox>
        )}
      </div>
    </>
  );
}
