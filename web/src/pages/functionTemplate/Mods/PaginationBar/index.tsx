import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

const PaginationBar = (props: { page: number; setPage: any; total?: number; pageSize: number }) => {
  const { page, setPage, total, pageSize } = props;
  const { t } = useTranslation();
  const totalPage = Math.ceil((total || 0) / pageSize);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className="flex w-full flex-wrap-reverse items-center justify-end pb-8 pr-16 pt-4 text-lg">
      <span className="mr-4">
        {t("Template.Total")}: {total}
      </span>
      <div
        className={clsx(
          "mr-2 cursor-pointer rounded-full px-2 py-1 hover:bg-gray-100",
          darkMode && "hover:bg-gray-700",
        )}
        onClick={() => {
          setPage(1);
        }}
      >
        <ArrowLeftIcon boxSize={2} />
      </div>
      <div
        className={clsx(
          "mr-2 cursor-pointer rounded-full p-1 hover:bg-gray-100",
          darkMode && "hover:bg-gray-700",
        )}
      >
        <ChevronLeftIcon
          onClick={() => {
            if (page === 1) return;
            setPage(page - 1);
          }}
        />
      </div>
      <span className={clsx(page === 1 && "text-gray-400", page === totalPage && "text-gray-400")}>
        {page}
      </span>
      <span className="px-2">/</span>
      <span>{totalPage}</span>
      <div
        className={clsx(
          "ml-2 cursor-pointer rounded-full p-1 hover:bg-gray-100",
          darkMode && "hover:bg-gray-700",
        )}
      >
        <ChevronRightIcon
          onClick={() => {
            if (page === totalPage) return;
            setPage(page + 1);
          }}
        />
      </div>
      <div
        className={clsx(
          "ml-2 cursor-pointer rounded-full px-2 py-1 hover:bg-gray-100",
          darkMode && "hover:bg-gray-700",
        )}
        onClick={() => {
          setPage(totalPage);
        }}
      >
        <ArrowRightIcon boxSize={2} />
      </div>
    </div>
  );
};

export default PaginationBar;
