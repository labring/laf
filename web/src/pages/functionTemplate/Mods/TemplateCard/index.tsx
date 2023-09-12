import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Avatar, Menu, MenuButton, MenuItem, MenuList, useColorMode } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import { LikeIcon, MedalIcon } from "@/components/CommonIcon";
import IconWrap from "@/components/IconWrap";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import { useDeleteFunctionTemplateMutation } from "../../service";
import { useFunctionTemplateStarMutation } from "../../service";
import useTemplateStore from "../../store";
import TemplatePopOver from "../TemplatePopover/TemplatePopover";

import { TFunctionTemplate } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

const TemplateCard = (props: {
  className?: string;
  isModal?: boolean;
  template: TFunctionTemplate;
  templateCategory?: string;
}) => {
  const { className, templateCategory, template, isModal } = props;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const deleteFunctionMutation = useDeleteFunctionTemplateMutation();
  const { t } = useTranslation();
  const { showSuccess } = useGlobalStore();
  const { setShowTemplateItem } = useTemplateStore();
  const darkMode = colorMode === "dark";
  const queryClient = useQueryClient();
  const starMutation = useFunctionTemplateStarMutation();
  const [starNumber, setStarNumber] = useState(template.star);
  const [starState, setStarState] = useState(template.stared);

  return (
    <div className={className}>
      <div
        className={clsx("cursor-pointer rounded-lg border-[1px]", isModal ? "pb-4" : "mr-4")}
        style={{ boxShadow: "0px 4px 4px 0px rgba(198, 205, 214, 0.25)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.outlineWidth = "2px";
          e.currentTarget.style.boxShadow = "0px 0px 0px 2px #66CBCA";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.outlineWidth = "1px";
          e.currentTarget.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
        }}
      >
        <TemplatePopOver template={template}>
          <div
            className="mx-5"
            onClick={() => {
              navigate(`${template._id}`);
              setShowTemplateItem(true);
            }}
          >
            <div className="mb-3 flex justify-between pt-4">
              <p
                className={clsx(
                  "flex items-center overflow-hidden text-ellipsis whitespace-nowrap font-semibold",
                  isModal ? "text-xl" : "text-2xl ",
                )}
              >
                {template.name}
              </p>
              <div className="flex space-x-2">
                {template.isRecommended && <MedalIcon />}
                {templateCategory === "default" && (
                  <div className="flex items-center">
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
                            navigate(`/market/templates/${template._id}/edit`);
                          }}
                        >
                          {t("Template.EditTemplate")}
                        </MenuItem>
                        <MenuItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            const res = await deleteFunctionMutation.mutateAsync({
                              id: template._id,
                            });
                            if (!res.error) {
                              showSuccess(t("DeleteSuccess"));
                              queryClient.invalidateQueries(["useGetMyFunctionTemplatesQuery"]);
                            }
                          }}
                        >
                          {t("Template.DeleteTemplate")}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                )}
              </div>
            </div>

            <p
              className={clsx(
                "mb-3 flex h-4 flex-grow-0 overflow-hidden text-ellipsis",
                darkMode ? "text-gray-300" : "text-second",
              )}
            >
              {template.description}
            </p>

            <div className="flex w-full overflow-hidden">
              {template.items.map((item) => {
                return (
                  <div
                    key={item.name}
                    className="mr-2 whitespace-nowrap rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-700"
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>

            {!isModal && (
              <div className="my-3 flex items-center justify-between">
                <span className="flex items-center">
                  <Avatar
                    boxSize="24px"
                    border={"1px solid #DEE0E2"}
                    src={getAvatarUrl(template?.uid)}
                    name={template.author}
                    className="mr-2"
                    bgColor="primary.500"
                    color="white"
                  />
                  {template.author}
                </span>
                <div
                  className={clsx(
                    "flex items-center text-lg hover:text-rose-500",
                    starState && "text-rose-500",
                  )}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await starMutation.mutateAsync({ templateId: template._id });
                    if (!res.error) {
                      if (res.data === "stared") {
                        setStarNumber(starNumber + 1);
                        setStarState(true);
                      } else {
                        setStarNumber(starNumber - 1);
                        setStarState(false);
                      }
                    }
                  }}
                >
                  <LikeIcon className="mr-1" /> {starNumber}
                </div>
              </div>
            )}
          </div>
        </TemplatePopOver>
      </div>
    </div>
  );
};

export default TemplateCard;
