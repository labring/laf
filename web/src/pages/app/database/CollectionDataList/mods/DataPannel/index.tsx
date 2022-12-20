import { useState } from "react";
import { useForm } from "react-hook-form";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import { Button, HStack, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import clsx from "clsx";

import JsonEditor from "@/components/Editor/JsonEditor";
import Pagination from "@/components/Pagination";
import getPageInfo from "@/utils/getPageInfo";

import { useAddDataMutation, useEntryDataQuery, useUpdateDataMutation } from "../../../service";

import DeleteButton from "./DeleteButton";
export default function DataPannel() {
  const [currentData, setCurrentData] = useState<any>(undefined);

  const [record, setRecord] = useState("");

  type FormData = {
    _id: string;
  };
  const defaultValues = {};
  const { handleSubmit, register, getValues } = useForm<FormData>({
    defaultValues,
  });

  const [queryData, setQueryData] = useState({
    ...defaultValues,
  });

  const DEFAULT_LIMIT = 10;

  const entryDataQuery = useEntryDataQuery({ ...queryData, limit: DEFAULT_LIMIT });

  const submit = () => {
    setQueryData({
      page: 1,
      ...getValues(),
    });
  };

  const addDataMutation = useAddDataMutation()

  const updateDataMutation = useUpdateDataMutation()

  const handleData = async () => {
    if (currentData?._id) {
      const params = JSON.parse(record);
      await updateDataMutation.mutateAsync(params)
    } else {
      const params = JSON.parse(record);
      await addDataMutation.mutateAsync(params)
    }
  }


  return (
    <>
      <div className="flex pb-4 shadow-sm justify-between items-center">
        <form
          onSubmit={(event) => {
            event?.preventDefault();
            entryDataQuery.refetch();
          }}
        >
          <div className="flex justify-between my-4">
            <HStack spacing={2}>
              <InputGroup width={400}>
                <InputLeftElement
                  height={"10"}
                  pointerEvents="none"
                  children={<Search2Icon color="gray.300" />}
                />
                <Input
                  borderRadius="4"
                  placeholder="_id"
                  bg="white"
                  {...register("_id")}
                />
              </InputGroup>
              <Button
                px={9}
                type={"submit"}
                colorScheme={"green"}
                onClick={handleSubmit(submit)}
                isLoading={entryDataQuery.isFetching}
              >
                搜索
              </Button>
            </HStack>
        
          </div>
        </form>
        <Button
          colorScheme={"primary"}
          size="sm"
          onClick={() => {
            setCurrentData({});
          }}
        >
          <AddIcon color="white" className="mr-2" />
          新增记录
        </Button>
        <Pagination
          values={getPageInfo(entryDataQuery.data as any)}
          onChange={(values) => {
              console.log(values)
              setQueryData({
                ...values,
                ...getValues(),
              });
            }}
          />
        {/* <span>总数: {entryDataQuery.data?.total}</span> */}
      </div>

      <div className="absolute top-20 bottom-0 right-2 flex left-4">
        <div className="overflow-y-auto flex-1 pr-2 overflow-x-hidden">
          {(entryDataQuery?.data?.list || [])?.map((item: any, index: number) => {
            return (
              <div
                key={item._id}
                className={clsx(
                  "border p-2 rounded-md relative group hover:border-green-600 hover:shadow-md",
                  {
                    "border-green-600 shadow-md": currentData?._id === item._id,
                    "mb-6": index !== (entryDataQuery?.data?.list || []).length - 1,
                  },
                )}
                onClick={() => {
                  setCurrentData(item);
                }}
              >
                <div
                  className={clsx(" absolute right-2 top-2  group-hover:block z-50 ", {
                    hidden: currentData?._id !== item._id,
                  })}
                >
                  <DeleteButton data={ item } />
                </div>

                <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                  {JSON.stringify(item, null, 2)}
                </SyntaxHighlighter>
              </div>
            );
          })}
        </div>
        <div
          className={clsx("flex-1 tarnsition-all duration-200 ease-in-out ", {
            "mr-2": typeof currentData !== "undefined",
          })}
          style={{
            maxWidth: typeof currentData !== "undefined" ? "50%" : "0",
          }}
        >
          <div
            className="border flex-col ml-2 flex rounded"
            style={{
              height: "-webkit-fill-available",
            }}
          >
            <div className="flex justify-between p-2 border-b mb-4">
              <span>{currentData?._id ? "编辑" : "新增"}</span>
              <div>
                <Button
                  size={"xs"}
                  colorScheme="blue"
                  bgColor={"blue.600"}
                  borderRadius="2"
                  px="4"
                  isLoading={currentData?._id?updateDataMutation.isLoading:addDataMutation.isLoading}
                  onClick={handleData}
                >
                  保存
                </Button>
                <Button
                  size={"xs"}
                  colorScheme="blue"
                  bgColor={"blue.600"}
                  borderRadius="2"
                  ml="3"
                  onClick={()=>setCurrentData(undefined)}
                >
                取消
                </Button>
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
      </div>
    </>
  );
}
