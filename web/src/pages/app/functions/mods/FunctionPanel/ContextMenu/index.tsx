import { Item, Menu } from "react-contexify";
import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import { EditIconLine, LinkIcon, RecycleDeleteIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import CopyText from "@/components/CopyText";
import IconText from "@/components/IconText";
import { COLOR_MODE } from "@/constants";

import { useDeleteFunctionMutation } from "../../../service";
import CreateModal from "../CreateModal";

import "./index.scss";
import "react-contexify/dist/ReactContexify.css";

import { TFunction } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

export default function ContextMenu(props: {
  functionItem: TFunction;
  tagsList: string[];
  hideAll: () => void;
}) {
  const { functionItem, tagsList, hideAll } = props;
  const { t } = useTranslation();
  const deleteFunctionMutation = useDeleteFunctionMutation();
  const { showSuccess, currentApp } = useGlobalStore();
  const darkMode = useColorMode().colorMode === COLOR_MODE.dark;

  return (
    <Menu
      id={functionItem._id}
      animation="fade"
      className="flex"
      theme={darkMode ? "dark" : "light"}
    >
      <Item closeOnClick={false}>
        <CreateModal functionItem={functionItem} tagList={tagsList} hideContextMenu={hideAll}>
          <IconText
            icon={
              <div className="flex h-5 items-center">
                <EditIconLine />
              </div>
            }
            text={t("Edit")}
          />
        </CreateModal>
      </Item>
      <Item>
        <ConfirmButton
          onSuccessAction={async () => {
            const res = await deleteFunctionMutation.mutateAsync(functionItem);
            if (!res.error) {
              showSuccess(t("DeleteSuccess"));
            }
          }}
          headerText={String(t("Delete"))}
          bodyText={String(t("FunctionPanel.DeleteConfirm"))}
          hideContextMenu={hideAll}
        >
          <IconText
            icon={
              <div className="flex h-5 items-center">
                <RecycleDeleteIcon fontSize={16} />
              </div>
            }
            text={t("Delete")}
            className="hover:!text-error-600"
          />
        </ConfirmButton>
      </Item>
      <Item>
        <CopyText text={`${currentApp.origin}/${functionItem.name}`} hideToolTip>
          <IconText
            icon={
              <div className="flex h-5 items-center">
                <LinkIcon fontSize={22} />
              </div>
            }
            text={t("Copy")}
            className="hover:!text-primary-400"
          />
        </CopyText>
      </Item>
    </Menu>
  );
}
