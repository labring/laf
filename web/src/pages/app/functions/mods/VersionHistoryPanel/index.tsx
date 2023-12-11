import { useTranslation } from "react-i18next";
import { Center, Spinner, useColorMode } from "@chakra-ui/react";
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
    <div className="h-full overflow-auto pt-2">
      {history.isFetching ? (
        <Center className="h-full">
          <Spinner />
        </Center>
      ) : history.data?.data.length !== 0 ? (
        history.data?.data.map((item: any, index: number) => {
          return (
            <FetchModal key={index} functionCode={item.source.code}>
              <div
                className={clsx(
                  "text-12px mx-3 flex h-10 cursor-pointer items-center justify-between rounded",
                  darkMode ? "hover:bg-grayModern-800" : "hover:bg-primary-100",
                )}
              >
                <div className="relative flex h-full items-center">
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
                  <span className="pl-4 font-medium">{formatDate(item.createdAt)}</span>
                </div>
                <span className={clsx("pr-2", darkMode ? "text-blue-500" : "text-blue-700")}>
                  #{history.data?.data.length - index}
                </span>
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
