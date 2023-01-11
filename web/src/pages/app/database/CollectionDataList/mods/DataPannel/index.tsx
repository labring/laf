import { useMemo, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon, EditIcon, Search2Icon } from "@chakra-ui/icons";
import { Button, HStack, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";
import clsx from "clsx";
import { debounce } from "lodash";

import JsonEditor from "@/components/Editor/JsonEditor";
import IconWrap from "@/components/IconWrap";
import Pagination from "@/components/Pagination";
import getPageInfo from "@/utils/getPageInfo";

import { useAddDataMutation, useEntryDataQuery, useUpdateDataMutation } from "../../../service";
import useDBMStore from "../../../store";

import DeleteButton from "./DeleteButton";
export default function DataPannel() {
  const [currentData, setCurrentData] = useState<any>(undefined);

  const [record, setRecord] = useState("");
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

  const DEFAULT_LIMIT = 10;

  const entryDataQuery = useEntryDataQuery({ ...queryData, limit: DEFAULT_LIMIT }, () => {
    setCurrentData({});
  });
  const addDataMutation = useAddDataMutation();

  const updateDataMutation = useUpdateDataMutation();

  const handleData = async () => {
    if (currentData?._id) {
      const params = JSON.parse(record);
      await updateDataMutation.mutateAsync(params);
    } else {
      const params = JSON.parse(record);
      await addDataMutation.mutateAsync(params);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
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
            添加数据
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
                    placeholder="请输入ID进行查询"
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
            console.log(values);
            setQueryData((pre: any) => {
              const newQuery = { ...pre, ...values };
              return newQuery;
            });
          }}
        />
        {/* <span>总数: {entryDataQuery.data?.total}</span> */}
      </div>

      <div className="flex" style={{ height: "calc(100% - 60px)" }}>
        <div className="overflow-y-auto flex-1 overflow-x-hidden">
          {(entryDataQuery?.data?.list || [])?.map((item: any, index: number) => {
            return (
              <div
                key={item._id}
                className={clsx("border-2 p-2 rounded-xl relative group/item", {
                  "shadow-lg": currentData?._id === item._id,
                  "mb-2": index !== (entryDataQuery?.data?.list || []).length - 1,
                })}
                onClick={() => {
                  setCurrentData(item);
                }}
              >
                <div
                  className={clsx(" absolute right-2 top-2  group-hover/item:block z-50 ", {
                    hidden: currentData?._id !== item._id,
                  })}
                >
                  <div className="flex">
                    <DeleteButton data={item} fn={setCurrentData} />
                    <IconWrap
                      showBg
                      tooltip="编辑"
                      size={32}
                      className="ml-2 hover:bg-third-100 group/icon"
                    >
                      <EditIcon className="group-hover/icon:text-third-500" />
                    </IconWrap>
                  </div>
                </div>
                <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                  {JSON.stringify(item, null, 2)}
                </SyntaxHighlighter>
              </div>
            );
          })}
        </div>
        <div
          className="border-2 flex-col ml-2 mb-3 flex rounded-xl px-4"
          style={{
            flexBasis: "421px",
          }}
        >
          <div className="flex justify-between item-center border-b-2 mb-4 py-2">
            <Text fontSize="md" className="leading-loose font-semibold">
              {currentData?._id ? "编辑" : "新增"}
            </Text>
            <div>
              <Button
                style={{ width: "56px" }}
                colorScheme="primary"
                fontSize="sm"
                size="md"
                isLoading={
                  currentData?._id ? updateDataMutation.isLoading : addDataMutation.isLoading
                }
                onClick={handleData}
              >
                保存
              </Button>
              {/* <Button
                size={"xs"}
                colorScheme="blue"
                bgColor={"blue.600"}
                borderRadius="2"
                ml="3"
                onClick={() => setCurrentData(undefined)}
              >
                取消
              </Button> */}
            </div>
          </div>
          <div className=" flex-1" style={{}}>
            <JsonEditor
              value={JSON.stringify(currentData || {}, null, 2)}
              onChange={(values) => {
                setRecord(values!);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
