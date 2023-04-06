import { useState } from "react";
import { useForm } from "react-hook-form";
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
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import Content from "@/components/Content";
import CopyText from "@/components/CopyText";
import JSONViewer from "@/components/Editor/JSONViewer";
import EmptyBox from "@/components/EmptyBox";
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
    },
  );

  const { colorMode } = useColorMode();

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
        <div className="relative h-full rounded-md py-1" style={{ paddingBottom: 100 }}>
          {logListQuery.isFetching ? (
            <Center className="bg-white-200 absolute bottom-0 left-0 right-0 top-0 z-10 opacity-60">
              <Spinner size="lg" />
            </Center>
          ) : null}
          <div className="mb-4 h-full overflow-y-auto ">
            {logListQuery.data?.data?.list?.length ? (
              logListQuery.data?.data?.list.map((item: TLogItem) => {
                return (
                  <div key={item._id} className=" h-[22px] overflow-hidden font-mono">
                    <span className="float-left mr-2 text-grayIron-600">
                      [{formatDate(item.created_at, "YYYY-MM-DD HH:mm:ss")}]
                    </span>

                    <CopyText text={item.request_id} className="float-left mr-2 text-primary-600">
                      <span>{item.request_id.substring(0, 8)}</span>
                    </CopyText>
                    <CopyText
                      text={item.func}
                      className="float-left mr-2 w-[100px] text-purple-700"
                    >
                      <span>{item.func}</span>
                    </CopyText>
                    <div
                      className=" mr-4 overflow-hidden"
                      onClick={() => {
                        setDetail(item);
                        onOpen();
                      }}
                    >
                      <pre className="max-h-[20px] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:text-blue-700 hover:underline">
                        {item.data.substring(0, 200)}
                      </pre>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyBox>
                <p>{t("LogPanel.EmptyLogTip")}</p>
              </EmptyBox>
            )}
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
              <JSONViewer colorMode={colorMode} code={detail?.data || ""} />
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
