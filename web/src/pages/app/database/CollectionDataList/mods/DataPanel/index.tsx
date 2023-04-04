import { useEffect, useMemo, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { AddIcon, CopyIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
} from "@chakra-ui/react";
import { t } from "i18next";
import { throttle } from "lodash";

import CopyText from "@/components/CopyText";
import JsonEditor from "@/components/Editor/JsonEditor";
import JSONViewer from "@/components/Editor/JSONViewer";
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
  const [currentData, setCurrentData] = useState<any>({ data: undefined, record: "{}" });
  const globalStore = useGlobalStore();
  const [search, setSearch] = useState("");
  const [isAdd, setIsAdd] = useState({ status: false, count: 0 });
  const store = useDBMStore((state) => state);
  const { colorMode } = useColorMode();
  type QueryData = {
    _id: string;
    page: number;
    limit?: number;
    total?: number;
  };

  const [queryData, setQueryData] = useState<QueryData>();

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
      const { total, page, limit } = getPageInfo(entryDataQuery.data);
      const newTotal = (total || 0) + isAdd.count;
      const maxPage = limit ? Math.ceil(newTotal / limit) : -1;
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
      params = JSON.parse(currentData.record);
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
      <Panel.Header className="h-[40px] w-full flex-shrink-0">
        <div className="flex items-center">
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
              disabled={store.currentDB === undefined}
              className="mr-2 font-bold"
            >
              {t("CollectionPanel.AddData")}
            </Button>
          </AddDataModal>

          <Button
            size="xs"
            variant="textGhost"
            disabled={store.currentDB === undefined}
            className="mr-2"
            isLoading={entryDataQuery.isFetching}
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
            <div className="my-4 flex justify-between">
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
        {entryDataQuery.status !== "loading" && entryDataQuery?.data?.list?.length! === 0 && (
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

        <>
          <RightPanelList
            ListQuery={entryDataQuery?.data?.list}
            setKey="_id"
            isActive={(item: any) => currentData.data?._id === item._id}
            customStyle={{
              "border-lafWhite-600": colorMode === "light",
            }}
            onClick={(data: any) => {
              setCurrentData({
                data: data,
                record: JSON.stringify(data),
              });
            }}
            deleteRuleMutation={deleteDataMutation}
            component={(item: any) => {
              return <JSONViewer colorMode={colorMode} code={JSON.stringify(item, null, 2)} />;
            }}
            toolComponent={(item: any) => {
              const newData = { ...item };
              delete newData._id;
              return (
                <IconWrap
                  showBg
                  tooltip={t("Copy").toString()}
                  size={32}
                  className="group/icon ml-2 hover:bg-gray-200"
                >
                  <CopyText
                    hideToolTip
                    text={JSON.stringify(newData, null, 2)}
                    tip={String(t("Copied"))}
                  >
                    <CopyIcon />
                  </CopyText>
                </IconWrap>
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
              <JsonEditor
                colorMode={colorMode}
                value={JSON.stringify(currentData.data || {}, null, 2)}
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
      </div>
    </>
  );
}
