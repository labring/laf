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
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";
import { Pages } from "@/constants";

import { useDeleteFunctionMutation, useFunctionListQuery } from "../../service";
import useFunctionStore from "../../store";

import CreateModal from "./CreateModal";

import { TFunction } from "@/apis/typing";
import AddTriggerModal from "@/pages/app/trigger/AddTriggerModal";
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
    <Panel className="flex-grow">
      <Panel.Header
        title={t`FunctionList`}
        actions={[
          <CreateModal key="create_modal">
            <IconWrap size={20} tooltip={"添加函数"}>
              <AddIcon fontSize={12} />
            </IconWrap>
          </CreateModal>,
        ]}
      />
      <div>
        <div className="flex items-center mb-3">
          <Input
            size="sm"
            rounded={"full"}
            placeholder={String(t("SearchPlaceholder"))}
            onChange={(event) => {
              setKeywords(event.target.value);
            }}
          />
        </div>

        <SectionList style={{ height: "calc(100vh - 420px)", overflowY: "auto" }}>
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
                  <div className="invisible flex items-center group-hover:visible">
                    <AddTriggerModal targetFunc={func.name}>
                      <IconWrap size={20} tooltip={"新建触发器"}>
                        <TriggerIcon fontSize={13} />
                      </IconWrap>
                    </AddTriggerModal>
                    <CreateModal functionItem={func}>
                      <IconWrap size={20} tooltip={"编辑函数"}>
                        <EditIcon fontSize={13} />
                      </IconWrap>
                    </CreateModal>

                    <ConfirmButton
                      onSuccessAction={async () => {
                        await deleteFunctionMutation.mutateAsync(func);
                      }}
                      headerText={String(t("Delete"))}
                      bodyText={String(t("DeleteConfirm"))}
                    >
                      <IconWrap tooltip={String(t("Delete"))}>
                        <DeleteIcon
                          className="ml-2"
                          fontSize={14}
                          color="gray.500"
                          _hover={{ color: "black" }}
                        />
                      </IconWrap>
                    </ConfirmButton>
                  </div>
                </SectionList.Item>
              );
            })}
        </SectionList>
      </div>
    </Panel>
  );
}
