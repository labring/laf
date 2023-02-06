import { useMemo, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from "@chakra-ui/react";
import { t } from "i18next";
import { debounce, throttle } from "lodash";

import JsonEditor from "@/components/Editor/JsonEditor";
import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import Panel from "@/components/Panel";
import getPageInfo from "@/utils/getPageInfo";

import AddDataModal from "../../../mods/AddDataModal/index";
import RightPanelEditBox from "../../../RightComponent/EditBox";
import RightPanelList from "../../../RightComponent/List";
import { useDeleteDataMutation, useEntryDataQuery, useUpdateDataMutation } from "../../../service";
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

  const entryDataQuery = useEntryDataQuery({ ...queryData }, (data: any) => {
    if (data?.data.length > 0) {
      setCurrentData(data.data[0]);
      setRecord(JSON.stringify(data.data[0]));
    } else {
      setCurrentData(undefined);
      setRecord("{}");
    }
  });

  const refresh = useMemo(
    () =>
      throttle(() => {
        setQueryData((pre: any) => {
          return {
            ...pre,
            page: 1,
          };
        });
        entryDataQuery.refetch();
      }, 1000),
    [setQueryData, entryDataQuery],
  );

  const updateDataMutation = useUpdateDataMutation();
  const deleteDataMutation = useDeleteDataMutation({
    onSuccess() {
      setQueryData((pre: any) => {
        return {
          ...pre,
          page: 1,
        };
      });
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
      await updateDataMutation.mutateAsync(params);
    } catch (error) {
      globalStore.showError(error?.toString());
      return;
    }
  };

  return (
    <>
      <Panel.Header className="w-full h-[60px] flex-shrink-0">
        <div className="flex items-center">
          <AddDataModal onSuccessSubmit={() => {}}>
            <Button
              disabled={store.currentDB === undefined}
              colorScheme="primary"
              className="mr-2"
              style={{ width: "114px" }}
              leftIcon={<AddIcon />}
            >
              {t("CollectionPanel.AddData")}
            </Button>
          </AddDataModal>
          <Button
            disabled={store.currentDB === undefined}
            colorScheme="primary"
            className="mr-2"
            style={{ width: "114px" }}
            leftIcon={<BiRefresh fontSize={20} />}
            onClick={refresh}
          >
            {t("RefreshData")}
          </Button>
          <form
            onSubmit={(event) => {
              event?.preventDefault();
              refresh();
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
        {entryDataQuery.isFetching ? (
          <Center className="h-full w-full opacity-60 bg-white-200">
            <Spinner size="lg" />
          </Center>
        ) : entryDataQuery?.data?.list.length ? (
          <>
            <RightPanelList
              ListQuery={entryDataQuery?.data?.list}
              setKey="_id"
              isActive={(item: any) => currentData?._id === item._id}
              onClick={(data: any) => {
                setCurrentData(data);
                setRecord(JSON.stringify(data));
              }}
              deleteRuleMutation={deleteDataMutation}
              component={(item: any) => {
                return (
                  <SyntaxHighlighter language="json" customStyle={{ background: "#fdfdfe" }}>
                    {JSON.stringify(item, null, 2)}
                  </SyntaxHighlighter>
                );
              }}
            />
            <RightPanelEditBox
              show={currentData?._id}
              title={t("Edit")}
              isLoading={updateDataMutation.isLoading}
              onSave={handleData}
            >
              <div className=" flex-1 mb-4 bg-lafWhite-400 rounded">
                <JsonEditor
                  value={JSON.stringify(currentData || {}, null, 2)}
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
              <span>{t("CollectionPanel.EmptyDataText")}</span>
              <AddDataModal onSuccessSubmit={() => {}}>
                <span className="ml-2 text-primary-600 hover:border-b-2 hover:border-primary-600 cursor-pointer">
                  {t("CreateNow")}
                </span>
              </AddDataModal>
            </div>
          </EmptyBox>
        )}
      </div>
    </>
  );
}
