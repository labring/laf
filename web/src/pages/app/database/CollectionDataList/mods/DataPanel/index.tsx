import { useMemo, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import { Button, HStack, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { t } from "i18next";
import { debounce } from "lodash";

import JsonEditor from "@/components/Editor/JsonEditor";
import Pagination from "@/components/Pagination";
import Panel from "@/components/Panel";
import getPageInfo from "@/utils/getPageInfo";

import RightPanelEditBox from "../../../RightComponent/EditBox";
import RightPanelList from "../../../RightComponent/List";
import {
  useAddDataMutation,
  useDeleteDataMutation,
  useEntryDataQuery,
  useUpdateDataMutation,
} from "../../../service";
import useDBMStore from "../../../store";

import useGlobalStore from "@/pages/globalStore";

export default function DataPanel() {
  const [currentData, setCurrentData] = useState<any>(undefined);
  const globalStore = useGlobalStore();

  const [record, setRecord] = useState("{}");
  const store = useDBMStore((state) => state);
  type QueryData = {
    _id: string;
    page: number;
    limit?: number;
    total?: number;
  };

  const [queryData, setQueryData] = useState<QueryData>();

  const search = useMemo(
    () =>
      debounce((data: string) => {
        setQueryData({
          page: 1,
          _id: data,
        });
      }, 1000),
    [setQueryData],
  );

  const entryDataQuery = useEntryDataQuery({ ...queryData }, () => {
    setCurrentData({});
  });
  const addDataMutation = useAddDataMutation();
  const updateDataMutation = useUpdateDataMutation();
  const deleteDataMutation = useDeleteDataMutation({
    onSuccess() {
      setCurrentData(undefined);
    },
  });

  const handleData = async () => {
    let params = {};
    try {
      params = JSON.parse(record);
      if (Object.keys(params).length === 0) {
        globalStore.showError(t("DataEntry.CreateError"));
        return;
      }
      if (currentData?._id) {
        await updateDataMutation.mutateAsync(params);
      } else {
        await addDataMutation.mutateAsync(params);
      }
    } catch (error) {
      globalStore.showError(error?.toString());
      return;
    }
  };

  return (
    <>
      <Panel.Header className="w-full h-[60px] flex-shrink-0">
        <div className="flex items-center">
          <Button
            disabled={store.currentDB === undefined}
            colorScheme="primary"
            className="mr-2"
            style={{ width: "114px" }}
            onClick={() => {
              setCurrentData({});
            }}
            leftIcon={<AddIcon />}
          >
            {t("CollectionPanel.AddData")}
          </Button>
          <form
            onSubmit={(event) => {
              event?.preventDefault();
              entryDataQuery.refetch();
            }}
          >
            <div className="flex justify-between my-4">
              <HStack spacing={2}>
                <InputGroup className="mr-4" width="268px">
                  <InputLeftElement
                    height={"8"}
                    pointerEvents="none"
                    children={<Search2Icon color="gray.300" />}
                  />
                  <Input
                    rounded={"full"}
                    disabled={store.currentDB === undefined}
                    placeholder={t("CollectionPanel.Search").toString()}
                    bg={"gray.100"}
                    size="sm"
                    onChange={(e) => search(e.target.value)}
                  />
                </InputGroup>
              </HStack>
            </div>
          </form>
        </div>
        <Pagination
          values={getPageInfo(entryDataQuery.data as any)}
          onChange={(values) => {
            setQueryData((pre: any) => {
              const newQuery = { ...pre, ...values };
              return newQuery;
            });
          }}
        />
      </Panel.Header>
      <div className="w-full flex flex-grow overflow-hidden">
        <RightPanelList
          ListQuery={entryDataQuery?.data?.list}
          setKey="_id"
          isActive={(item: any) => currentData?._id === item._id}
          onClick={(data: any) => {
            setCurrentData(data);
          }}
          deleteRuleMutation={deleteDataMutation}
          component={(item: any) => {
            return (
              <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                {JSON.stringify(item, null, 2)}
              </SyntaxHighlighter>
            );
          }}
        />
        <RightPanelEditBox
          title={currentData?._id ? t("Edit") : t("Create")}
          isLoading={currentData?._id ? updateDataMutation.isLoading : addDataMutation.isLoading}
          onSave={handleData}
        >
          <div className=" flex-1" style={{}}>
            <JsonEditor
              value={JSON.stringify(currentData || {}, null, 2)}
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
