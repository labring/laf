/****************************
 * cloud functions list sidebar
 ***************************/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/react";
import { t } from "i18next";

import { TriggerIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import MoreButton from "@/components/MoreButton";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";
import { Pages } from "@/constants";

import { useDeleteFunctionMutation, useFunctionListQuery } from "../../service";
import useFunctionStore from "../../store";
import TriggerModal from "../TriggerModal";

import CreateModal from "./CreateModal";

import { TFunction } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

export default function FunctionList() {
  const { setCurrentFunction, currentFunction, setAllFunctionList, allFunctionList } =
    useFunctionStore((store) => store);

  const [keywords, setKeywords] = useState("");

  const { currentApp } = useGlobalStore();

  const { id: functionName } = useParams();
  const navigate = useNavigate();

  useFunctionListQuery({
    onSuccess: (data) => {
      setAllFunctionList(data.data);
      if (!currentFunction?.id && data.data.length > 0) {
        const currentFunction =
          data.data.find((item: TFunction) => item.name === functionName) || data.data[0];
        setCurrentFunction(currentFunction);
        navigate(`/app/${currentApp?.appid}/${Pages.function}/${currentFunction?.name}`, {
          replace: true,
        });
      }
    },
  });

  useEffect(() => {
    return () => {
      // clear current function
      setCurrentFunction({});
    };
  }, [setCurrentFunction]);

  const deleteFunctionMutation = useDeleteFunctionMutation();

  return (
    <Panel className="flex-grow overflow-hidden">
      <Panel.Header
        title={t`FunctionPanel.FunctionList`}
        actions={[
          <TriggerModal key="trigger_modal">
            <IconWrap size={20} tooltip={t("TriggerPanel.Trigger").toString()}>
              <TriggerIcon fontSize={13} />
            </IconWrap>
          </TriggerModal>,
          <CreateModal key="create_modal">
            <IconWrap size={20} tooltip={t("FunctionPanel.AddFunction").toString()}>
              <AddIcon fontSize={12} />
            </IconWrap>
          </CreateModal>,
        ]}
      />
      <div className="flex items-center mb-3">
        <Input
          size="sm"
          rounded={"full"}
          placeholder={String(t("FunctionPanel.SearchPlaceholder"))}
          onChange={(event) => {
            setKeywords(event.target.value);
          }}
        />
      </div>
      <SectionList className="flex-grow" style={{ overflowY: "auto" }}>
        {(allFunctionList || [])
          .filter((item: TFunction) => item?.name.includes(keywords))
          .map((func: any) => {
            return (
              <SectionList.Item
                isActive={func?.name === currentFunction?.name}
                key={func?.name || ""}
                className="group"
                onClick={() => {
                  setCurrentFunction(func);
                  navigate(`/app/${currentApp?.appid}/${Pages.function}/${func?.name}`);
                }}
              >
                <div>
                  <FileTypeIcon type={FileType.ts} />
                  <span className="ml-2 font-medium text-black">{func?.name}</span>
                </div>
                <MoreButton isHidden={func.name !== currentFunction?.name}>
                  <>
                    <CreateModal functionItem={func}>
                      <div className="text-grayIron-600">
                        <div className="text-grayModern-900 w-[20px] h-[20px] text-center pl-1">
                          <EditIcon />
                        </div>
                        {t("Edit")}
                      </div>
                    </CreateModal>
                    <ConfirmButton
                      onSuccessAction={async () => {
                        await deleteFunctionMutation.mutateAsync(func);
                      }}
                      headerText={String(t("Delete"))}
                      bodyText={String(t("FunctionPanel.DeleteConfirm"))}
                    >
                      <div className="text-grayIron-600">
                        <div className="text-grayModern-900 w-[20px] h-[20px] text-center">
                          <DeleteIcon />
                        </div>
                        {t("Delete")}
                      </div>
                    </ConfirmButton>
                  </>
                </MoreButton>
              </SectionList.Item>
            );
          })}
      </SectionList>
    </Panel>
  );
}
