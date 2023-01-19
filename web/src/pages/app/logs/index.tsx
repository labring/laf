import { useState } from "react";
import { useForm } from "react-hook-form";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  Button,
  Center,
  HStack,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import Content from "@/components/Content";
import CopyText from "@/components/CopyText";
import Pagination from "@/components/Pagination";
import Panel from "@/components/Panel";
import { formatDate } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { queryKeys } from "./service";

import styles from "./index.module.scss";

import { TLogItem } from "@/apis/typing";
import { LogControllerGetLogs } from "@/apis/v1/apps";

const LIMIT_OPTIONS = [100, 150, 200];

const DEFAULT_PAGE_INFO = {
  page: 1,
  limit: 100,
};

export default function LogsPage() {
  type FormData = {
    requestId: string;
    functionName: string;
    limit: number;
    page: number;
  };

  const { handleSubmit, register, getValues } = useForm<FormData>({});

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [detail, setDetail] = useState<TLogItem | undefined>(undefined);

  const [queryData, setQueryData] = useState(DEFAULT_PAGE_INFO);

  const logListQuery = useQuery(
    [queryKeys.useLogsQuery, queryData],
    () => {
      return LogControllerGetLogs({ ...queryData });
    },
    {
      keepPreviousData: true,
      onSuccess(data: any) {
        console.log(data);
      },
    },
  );

  const submit = () => {
    setQueryData({
      ...getValues(),
      ...DEFAULT_PAGE_INFO,
    });
    setTimeout(() => {
      logListQuery.refetch();
    }, 100);
  };

  return (
    <Content>
      <Panel className="h-full">
        <form
          onSubmit={(event) => {
            event?.preventDefault();
            logListQuery.refetch();
          }}
        >
          <Panel.Header>
            <HStack spacing={2}>
              <InputGroup width={300}>
                <Input
                  borderRadius="4"
                  size="sm"
                  placeholder="Request ID"
                  {...register("requestId")}
                />
              </InputGroup>

              <Input
                width={200}
                size="sm"
                placeholder={t("FunctionPanel.FunctionName").toString()}
                bg="white"
                {...register("functionName")}
              />

              <Button
                size="sm"
                py={4}
                px={6}
                type={"submit"}
                onClick={handleSubmit(submit)}
                isLoading={logListQuery.isFetching}
              >
                {t("Search")}
              </Button>
            </HStack>
            <Pagination
              options={LIMIT_OPTIONS}
              values={getPageInfo(logListQuery.data?.data)}
              onChange={(values) => {
                setQueryData({
                  ...values,
                  ...getValues(),
                });
              }}
            />
          </Panel.Header>
        </form>
        <div className="py-1 rounded-md h-full relative" style={{ paddingBottom: 100 }}>
          {logListQuery.isFetching ? (
            <Center className="opacity-60 bg-white-200 absolute left-0 right-0 top-0 bottom-0 z-10">
              <Spinner size={"lg"} />
            </Center>
          ) : null}
          <div className="overflow-y-auto h-full mb-4 ">
            {logListQuery.data?.data?.list.map((item: TLogItem) => {
              return (
                <div key={item._id} className=" h-[22px] font-mono overflow-hidden">
                  <span className="mr-2 text-grayIron-600 float-left">
                    [{formatDate(item.created_at, "YYYY-MM-DD HH:mm:ss")}]
                  </span>

                  <CopyText text={item.request_id} className="mr-2 text-primary-600 float-left">
                    <span>{item.request_id.substring(0, 8)}</span>
                  </CopyText>
                  <CopyText text={item.func} className="mr-2 w-[100px] text-purple-700 float-left">
                    <span>{item.func}</span>
                  </CopyText>
                  <div
                    className=" overflow-hidden mr-4"
                    onClick={() => {
                      setDetail(item);
                      onOpen();
                    }}
                  >
                    <pre className="hover:text-blue-700 hover:underline max-h-[20px] overflow-hidden cursor-pointer whitespace-nowrap text-ellipsis">
                      {item.data.substring(0, 200)}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Modal onClose={onClose} isOpen={isOpen} scrollBehavior={"inside"} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t("LogPanel.Detail")}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div>
                <span className={styles.primaryText}>Time: </span>
                {formatDate(detail?.created_at, "YYYY-MM-DD HH:mm:ss")}
              </div>
              <div>
                <span className={styles.primaryText}>Request ID: </span>
                {detail?.request_id}
              </div>
              <div>
                <span className={styles.primaryText}>Function: </span>
                {detail?.func}
              </div>
              <span className={styles.primaryText}>Content: </span>
              <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                {detail?.data || ""}
              </SyntaxHighlighter>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>{t("Close")}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Panel>
    </Content>
  );
}
