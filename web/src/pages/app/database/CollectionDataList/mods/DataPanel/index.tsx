import { useEffect, useMemo, useState } from "react";
import { AddIcon, LinkIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
} from "@chakra-ui/react";
import { EJSON } from "bson";
import { t } from "i18next";
import { throttle } from "lodash";

import { OutlineCopyIcon, RefreshIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import JSONEditor from "@/components/Editor/JSONEditor";
import JSONViewer from "@/components/Editor/JSONViewer";
import EmptyBox from "@/components/EmptyBox";
import IconWrap from "@/components/IconWrap";
import Pagination from "@/components/Pagination";
import Panel from "@/components/Panel";
import { COLOR_MODE } from "@/constants";
import getPageInfo from "@/utils/getPageInfo";

import AddDataModal from "../../../mods/AddDataModal/index";
import IndexModal from "../../../mods/IndexModal";
import RightPanelEditBox from "../../../RightComponent/EditBox";
import RightPanelList from "../../../RightComponent/List";
import { useDeleteDataMutation, useEntryDataQuery, useUpdateDataMutation } from "../../../service";
import useDBMStore from "../../../store";

import "./index.module.scss";

import useGlobalStore from "@/pages/globalStore";

function stringifyEJSONAndFormat(data: any) {
  // get stringified EJSON
  const ejson = EJSON.stringify(data);

  // parse ejson string to json object
  const parsed = JSON.parse(ejson);

  // format json object
  const formatted = JSON.stringify(parsed, null, 2);

  return formatted;
}

export default function DataPanel() {
  const [currentData, setCurrentData] = useState<any>({ data: undefined, record: "{}" });
  const globalStore = useGlobalStore();
  const [search, setSearch] = useState("");
  const [isAdd, setIsAdd] = useState({ status: false, count: 0 });
  const store = useDBMStore((state) => state);
  const { colorMode } = useColorMode();
  type QueryData = {
    _id: string;
    page: number;
    pageSize?: number;
    total?: number;
  };

  const [queryData, setQueryData] = useState<QueryData>();
  const darkMode = colorMode === COLOR_MODE.dark;

  useEffect(() => {
    if (store.currentDB !== undefined) {
      setQueryData((pre: any) => {
        return {
          ...pre,
          page: 1,
        };
      });
      setCurrentData({
        data: undefined,
        record: "{}",
      });
    }
  }, [store.currentDB, setCurrentData]);

  const entryDataQuery = useEntryDataQuery({ ...queryData }, (data: any) => {});
  const updateDataMutation = useUpdateDataMutation();
  const deleteDataMutation = useDeleteDataMutation({
    onSuccess() {
      setCurrentData({
        data: undefined,
        record: "{}",
      });
    },
  });

  useEffect(() => {
    if (entryDataQuery.isFetched && isAdd.status) {
      const { total, page, pageSize } = getPageInfo(entryDataQuery.data as any);
      const newTotal = (total || 0) + isAdd.count;
      const maxPage = pageSize ? Math.ceil(newTotal / pageSize) : -1;
      // Calculate and jump to the maxPage after adding
      if (maxPage > 0 && page !== maxPage) {
        setQueryData((pre: any) => {
          const newQuery = { ...pre, page: maxPage };
          return newQuery;
        });
      }
      setIsAdd({ status: false, count: 0 });
    }
  }, [entryDataQuery, isAdd]);

  useEffect(() => {
    if (entryDataQuery.isFetched) {
      const data = entryDataQuery?.data?.list || [];
      if (data?.length > 0 && currentData.data === undefined) {
        setCurrentData({
          data: data[0],
          record: JSON.stringify(data[0]),
        });
      } else if (data?.length === 0) {
        setCurrentData({
          data: undefined,
          record: "{}",
        });
      } else {
        const newData = data.filter((item: any) => item._id === currentData.data._id)[0];
        setCurrentData({
          data: newData,
          record: JSON.stringify(newData),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryDataQuery?.data?.list]);

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
        globalStore.showSuccess(t("RefreshDataSuccess"));
      }, 1000),
    [setQueryData, entryDataQuery, globalStore],
  );

  const handleData = async () => {
    let params = {};
    try {
      params = EJSON.parse(currentData.record) as any;
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
      <Panel.Header className="my-1 flex-shrink-0">
        <div className="flex flex-1 items-center">
          <AddDataModal
            schema={currentData.data ? currentData.data : {}}
            onSuccessSubmit={(id: string, count: number) => {
              setIsAdd({
                status: true,
                count,
              });
              setCurrentData((pre: any) => {
                return {
                  ...pre,
                  data: { _id: id },
                };
              });
            }}
          >
            <Button
              size="xs"
              variant="textGhost"
              leftIcon={<AddIcon fontSize={10} className="text-grayModern-500" />}
              disabled={!store.currentDB}
              isLoading={entryDataQuery.isFetching}
              className="mr-2 font-bold"
            >
              {t("CollectionPanel.AddData")}
            </Button>
          </AddDataModal>

          <Button
            size="xs"
            variant="textGhost"
            disabled={!store.currentDB}
            className="mr-2"
            isLoading={entryDataQuery.isFetching}
            leftIcon={<RefreshIcon fontSize={16} />}
            onClick={() => refresh(search)}
          >
            {t("RefreshData")}
          </Button>
          <IndexModal>
            <Button
              size="xs"
              variant="textGhost"
              disabled={!store.currentDB}
              className="mr-2"
              isLoading={entryDataQuery.isFetching}
              leftIcon={<LinkIcon fontSize={10} />}
            >
              {t("CollectionPanel.IndexManage")}
            </Button>
          </IndexModal>
          <form
            className="flex flex-1"
            onSubmit={(event) => {
              event?.preventDefault();
              refresh(search);
            }}
          >
            <div className="my-4 flex flex-1 justify-between">
              <HStack spacing={2} className="flex flex-1">
                <InputGroup className="mr-4 flex-1">
                  <InputLeftElement
                    height="7"
                    pointerEvents="none"
                    children={<Search2Icon color="gray.300" />}
                  />
                  <Input
                    rounded="full"
                    disabled={store.currentDB === undefined}
                    placeholder={t("CollectionPanel.Query").toString()}
                    size="sm"
                    height="7"
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
            setCurrentData({
              data: undefined,
              record: "{}",
            });
            setQueryData((pre: any) => {
              const newQuery = { ...pre, ...values };
              return newQuery;
            });
          }}
        />
      </Panel.Header>
      <div className="flex w-full flex-grow overflow-hidden">
        {entryDataQuery.status !== "loading" && entryDataQuery?.data?.list?.length === 0 && (
          <EmptyBox>
            <div>
              <span>{t("CollectionPanel.EmptyDataText")}</span>
              <AddDataModal schema={{}}>
                <span className="ml-2 cursor-pointer text-primary-600 hover:border-b-2 hover:border-primary-600">
                  {t("CreateNow")}
                </span>
              </AddDataModal>
            </div>
          </EmptyBox>
        )}

        {entryDataQuery?.data?.list?.length !== 0 && (
          <>
            <RightPanelList
              ListQuery={entryDataQuery?.data?.list}
              setKey="_id"
              isActive={(item: any) => currentData.data?._id === item._id}
              customStyle={{
                "border-lafWhite-600": colorMode === COLOR_MODE.light,
              }}
              onClick={(data: any) => {
                setCurrentData({
                  data: data,
                  record: JSON.stringify(data),
                });
              }}
              deleteRuleMutation={deleteDataMutation}
              component={(item: any) => {
                const code = JSON.stringify(item, null, 2);
                return <JSONViewer colorMode={colorMode} code={code} className="dataList" />;
              }}
              toolComponent={(item: any) => {
                const newData = { ...item };
                delete newData._id;

                const text = stringifyEJSONAndFormat(newData);
                return (
                  <CopyText
                    hideToolTip
                    text={text}
                    tip={String(t("Copied"))}
                    className={darkMode ? "ml-2 hover:bg-gray-600" : "ml-2 hover:bg-gray-200"}
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
              show={currentData.data?._id}
              title={t("Edit")}
              isLoading={updateDataMutation.isLoading}
              onSave={handleData}
            >
              <div className="mb-4 flex-1 rounded">
                <JSONEditor
                  colorMode={colorMode}
                  value={stringifyEJSONAndFormat(currentData.data || {})}
                  onChange={(values) => {
                    setCurrentData((pre: any) => {
                      return {
                        ...pre,
                        record: values!,
                      };
                    });
                  }}
                />
              </div>
            </RightPanelEditBox>
          </>
        )}
      </div>
    </>
  );
}
