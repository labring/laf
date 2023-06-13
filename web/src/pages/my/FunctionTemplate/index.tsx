import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RepeatClockIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { FileIcon, LikeIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";
import { formatDate } from "@/utils/format";

import { useGetMyFunctionTemplatesQuery } from "../service";

import { TemplateList } from "@/apis/typing";
import PaginationBar from "@/pages/my/Mods/PaginationBar";

export default function FunctionTemplate(props: { queryData: { stared: boolean } }) {
  const { queryData } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [myTemplateList, setMyTemplateList] = useState<TemplateList>();
  const [page, setPage] = useState(1);

  useGetMyFunctionTemplatesQuery(
    {
      ...queryData,
      page: page,
    },
    {
      onSuccess: (data: any) => {
        setMyTemplateList(data.data);
      },
    },
  );

  return (
    <div className="pt-4">
      <div className="flex flex-wrap justify-between pl-64 pr-8">
        {(myTemplateList?.list || []).map((item) => {
          return (
            <div className={clsx("mb-4 w-1/2")} key={item._id}>
              <div
                className="mr-8 cursor-pointer rounded-lg border-[1px] py-2"
                style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                onClick={(event: any) => {
                  event?.preventDefault();
                  if (!queryData?.stared) {
                    navigate(`/my/edit/${item._id}`);
                  } else {
                    navigate(`/function-templates/${item._id}`);
                  }
                }}
              >
                <div className="p-2 px-4">
                  <div
                    className={clsx(
                      "flex justify-between pb-1",
                      darkMode ? "text-gray-300" : "text-second",
                    )}
                  >
                    <div className="flex items-center">
                      <RepeatClockIcon />
                      <span className="pl-1">
                        {t("Template.CreatedAt")} {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        "px-2 font-semibold",
                        item.private === false
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600",
                      )}
                    >
                      {item.private ? "Private" : "Public"}
                    </span>
                  </div>
                  <div className="flex items-center pb-1 text-xl font-semibold">
                    <FileTypeIcon fontSize={20} type="ts" />
                    <span className="pl-2">{item.name}</span>
                  </div>
                  <div className={clsx("h-4", darkMode ? "text-gray-300" : "text-second")}>
                    {item.description}
                  </div>
                  {/* <div className="flex">
                    {item.tags.map((tag) => {
                      return (
                        <div
                          className={clsx(
                            "mr-2 rounded-md p-1",
                            darkMode ? "bg-gray-600" : "bg-gray-100",
                          )}
                        >
                          {tag}
                        </div>
                      );
                    })}
                  </div> */}
                </div>
                <div className="flex items-center justify-between px-4 pb-2">
                  <div className="flex items-center">
                    {/* <Avatar name={item.author} size={"xs"} src={item.avatar} /> */}
                    <span className={clsx("pr-2", darkMode ? "text-gray-300" : "text-second")}>
                      {t("Template.updatedAt")} {formatDate(item.updatedAt)}
                    </span>
                    {/* <DraftIcon />
                    <span className={clsx("pl-1", darkMode ? "text-gray-300" : "text-second")}>{t("Template.Draft")}</span> */}
                  </div>
                  <div className="flex flex-col pl-2">
                    <div className="flex items-center text-base">
                      <span className="px-1">
                        <FileIcon /> {item.items.length}
                      </span>
                      {/* <span className="px-1">
                        <UserIcon /> {item.usedBy}
                      </span> */}
                      <span className="px-1">
                        <LikeIcon /> {item.star}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <PaginationBar page={page} setPage={setPage} pageSize={10} total={myTemplateList?.total} />
    </div>
  );
}
