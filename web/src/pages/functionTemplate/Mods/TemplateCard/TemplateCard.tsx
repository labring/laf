import { useTranslation } from "react-i18next";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuList, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { LikeIcon, TimeIcon } from "@/components/CommonIcon";
import IconWrap from "@/components/IconWrap";
import { formatDate } from "@/utils/format";

import { useDeleteFunctionTemplateMutation } from "../../service";

import { TFunctionTemplate } from "@/apis/typing";

interface IProps {
  className?: string;
  template: TFunctionTemplate;
  templateCategory: string;
  onClick: () => void;
}

const TemplateCard = (props: IProps) => {
  const { onClick, className, templateCategory, template } = props;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const deleteFunctionMutation = useDeleteFunctionTemplateMutation();
  const { t } = useTranslation();

  const darkMode = colorMode === "dark";

  return (
    <div className={className}>
      <div
        className="mr-4 cursor-pointer rounded-lg border-[1px]"
        style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.outlineWidth = "2px";
          e.currentTarget.style.boxShadow =
            "0px 2px 4px rgba(0, 0, 0, 0.1), 0px 0px 0px 2px #66CBCA";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.outlineWidth = "1px";
          e.currentTarget.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
        }}
      >
        <div className="mx-5" onClick={onClick}>
          <div className={clsx("mb-3 flex justify-between pt-4")}>
            <div className="flex items-center text-2xl font-semibold">
              <div className="truncate">{template.name}</div>
            </div>
            <div className="flex items-center">
              {templateCategory === "my" && (
                <span
                  className={clsx(
                    "mr-3 px-2 font-semibold",
                    template.private === false
                      ? "bg-blue-100 text-blue-600"
                      : "bg-adora-200 text-adora-600",
                  )}
                >
                  {template.private ? "Private" : "Public"}
                </span>
              )}
              {templateCategory === "my" && (
                <Menu placement="bottom-end">
                  <MenuButton
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <IconWrap>
                      <BsThreeDotsVertical size={12} />
                    </IconWrap>
                  </MenuButton>
                  <MenuList width={12} minW={24}>
                    <MenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/market/templates/${templateCategory}/${template._id}/edit`);
                      }}
                    >
                      {t("Template.EditTemplate")}
                    </MenuItem>
                    <MenuItem
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteFunctionMutation.mutateAsync({ id: template._id });
                        window.location.reload();
                      }}
                    >
                      {t("Template.DeleteTemplate")}
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </div>
          </div>

          <div
            className={clsx(
              "mb-3 flex h-4 items-center truncate",
              darkMode ? "text-gray-300" : "text-second",
            )}
          >
            {template.description}
          </div>

          <div className="flex w-full overflow-hidden">
            {template.items.map((item) => {
              return (
                <div
                  key={item.name}
                  className="mr-2 rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-700 "
                >
                  {item.name}
                </div>
              );
            })}
          </div>

          <div className="my-3 flex items-center justify-between">
            <span
              className={clsx(
                "flex items-center pr-2",
                darkMode ? "text-gray-300" : "text-grayModern-500",
              )}
            >
              <TimeIcon className="mr-1.5" />
              {t("Template.updatedAt")} {formatDate(template.updatedAt)}
            </span>
            <div className="flex text-base">
              <span className="pl-2">
                <LikeIcon /> {template.star}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
