import { useEffect, useMemo, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon, CopyIcon, Search2Icon } from "@chakra-ui/icons";
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
import { throttle } from "lodash";

import CopyText from "@/components/CopyText";
import JsonEditor from "@/components/Editor/JsonEditor";
import EmptyBox from "@/components/EmptyBox";
import IconWrap from "@/components/IconWrap";
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
  const [search, setSearch] = useState("");
  const [isAdd, setIsAdd] = useState({ status: false, count: 0 });
  const store = useDBMStore((state) => state);
  type QueryData = {
    _id: string;
    page: number;
    limit?: number;
    total?: number;
  };

  const [queryData, setQueryData] = useState<QueryData>();

  // 当前集合发生变化就把currentData置空
  useEffect(() => {
    if (store.currentDB !== undefined) {
      setCurrentData(undefined);
      setRecord("{}");
    }
  }, [store.currentDB, setRecord, setCurrentData]);

  const entryDataQuery = useEntryDataQuery({ ...queryData }, (data: any) => {});
  const updateDataMutation = useUpdateDataMutation({
    onSuccess: (data) => {},
  });
  const deleteDataMutation = useDeleteDataMutation({
    onSuccess() {
      setCurrentData(undefined);
      setRecord("{}");
    },
  });

  useEffect(() => {
    if (entryDataQuery.isFetched) {
      const data = entryDataQuery?.data?.list || [];
      if (data?.length > 0 && currentData === undefined) {
        setCurrentData(data[0]);
        setRecord(JSON.stringify(data[0]));
      } else if (data?.length === 0) {
        setCurrentData(undefined);
        setRecord("{}");
      } else {
        const newData = data.filter((item) => item._id === currentData._id)[0];
        setCurrentData(newData);
        setRecord(JSON.stringify(newData));
      }
    }
  }, [entryDataQuery?.data?.list, setCurrentData, setRecord]);
  // 这里的依赖缺currentData和entryDataQuery.isFetched，但是如果加上会一直循环

  useEffect(() => {
    if (entryDataQuery.isFetched && isAdd.status) {
      const { total, page, limit } = getPageInfo(entryDataQuery.data);
      const newTotal = (total || 0) + isAdd.count;
      const maxPage = limit ? Math.ceil(newTotal / limit) : -1;
      if (maxPage > 0 && page !== maxPage) {
        setQueryData((pre: any) => {
          const newQuery = { ...pre, page: maxPage };
          return newQuery;
        });
        setIsAdd({ status: false, count: 0 });
      }
    }
  }, [entryDataQuery, isAdd]);

  const refresh = useMemo(
    () =>
      throttle((data: string) => {
        setQueryData((pre: any) => {
          return {
            ...pre,
            _id: data,
          };
        });
        entryDataQuery.refetch();
      }, 1000),
    [setQueryData, entryDataQuery],
  );

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
          <AddDataModal
            schema={currentData ? currentData : {}}
            onSuccessSubmit={(id: string, count: number) => {
              setIsAdd({
                status: true,
                count,
              });
              setCurrentData({
                _id: id,
              });
            }}
          >
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
            onClick={() => refresh(search)}
          >
            {t("RefreshData")}
          </Button>
          <form
            onSubmit={(event) => {
              event?.preventDefault();
              refresh(search);
            }}
          >
            <div className="flex justify-between my-4">
              <HStack spacing={2}>
                <InputGroup className="mr-4" width="300px">
                  <InputLeftElement
                    height={"8"}
                    pointerEvents="none"
                    children={<Search2Icon color="gray.300" />}
                  />
                  <Input
                    rounded={"full"}
                    disabled={store.currentDB === undefined}
                    placeholder={t("CollectionPanel.Query").toString()}
                    bg={"gray.100"}
                    size="sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
            setCurrentData(undefined);
            setRecord("{}");
          }}
        />
      </Panel.Header>
      <div className="w-full flex flex-grow overflow-hidden">
        {entryDataQuery.isFetching ? (
          <Center className="h-full w-full opacity-60 bg-white-200">
            <Spinner size="lg" />
          </Center>
        ) : entryDataQuery?.data?.list?.length ? (
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
              toolComponent={(item: any) => {
                const newData = { ...item };
                delete newData._id;
                return (
                  <IconWrap
                    showBg
                    tooltip={t("Copy").toString()}
                    size={32}
                    className="ml-2 hover:bg-rose-100 group/icon"
                  >
                    <CopyText
                      hideToolTip
                      text={JSON.stringify(newData, null, 2)}
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
              <AddDataModal schema={{}}>
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
