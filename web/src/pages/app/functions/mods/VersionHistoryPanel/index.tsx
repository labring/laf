import { useTranslation } from "react-i18next";
import { Center, Divider, Spinner, Tooltip, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import EmptyBox from "@/components/EmptyBox";
import { formatDate } from "@/utils/format";

import { useFunctionHistoryQuery } from "../../service";
import useFunctionStore from "../../store";

import FetchModal from "./FetchModal";

export default function VersionHistoryPanel() {
  const { currentFunction } = useFunctionStore((state) => state);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const { t } = useTranslation();

  const history = useFunctionHistoryQuery(encodeURIComponent(currentFunction.name), {
    enabled: currentFunction.name !== undefined,
  });

  return (
    <div className="h-full w-full pt-2">
      {history.isFetching ? (
        <Center className="h-full">
          <Spinner />
        </Center>
      ) : history.data?.data.length !== 0 ? (
        history.data?.data.map((item: any, index: number) => {
          return (
            <FetchModal key={index} functionCode={item.source.code}>
              <div>
                <Tooltip label={item.changelog || "changed"} placement="left">
                  <div className="mx-3">
                    <div
                      className={clsx(
                        "flex h-10 cursor-pointer items-center justify-between rounded",
                        darkMode ? "hover:bg-grayModern-800" : "hover:bg-primary-100",
                      )}
                    >
                      <div className="relative flex h-full items-center truncate">
                        <span
                          className={clsx(
                            "absolute ml-2 h-2.5 w-2.5 rounded-full border-[2px] border-primary-600",
                            darkMode ? "bg-grayModern-900" : "bg-white",
                          )}
                        />
                        <div
                          className={clsx(
                            "ml-3 flex  h-full",
                            index === 0 && "items-end",
                            index === history.data?.data.length - 1 && "items-start",
                          )}
                        >
                          <div
                            className={clsx(
                              "border",
                              history.data?.data.length === 1 && "border-transparent",
                              (index === 0 || index === history.data?.data.length - 1) && "h-1/2",
                              !(index === 0 || index === history.data?.data.length - 1) && "h-full",
                            )}
                          />
                        </div>
                        <div className="truncate pl-4">
                          <p className="truncat text-[12px] font-medium">
                            {item.changelog || "changed"}
                          </p>
                          <p className="text-[10px] text-gray-500">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                      <span className={clsx("px-2", darkMode ? "text-blue-500" : "text-blue-700")}>
                        #{history.data?.data.length - index}
                      </span>
                    </div>
                    {index !== history.data?.data.length - 1 && <Divider />}
                  </div>
                </Tooltip>
              </div>
            </FetchModal>
          );
        })
      ) : (
        <EmptyBox hideIcon>
          <span>{t("FunctionPanel.HistoryTips")}</span>
        </EmptyBox>
      )}
    </div>
  );
}
