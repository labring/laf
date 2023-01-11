/****************************
 * cloud functions list sidebar
 ***************************/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DeleteIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/react";
import { t } from "i18next";

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
import useGlobalStore from "@/pages/globalStore";

export default function FunctionList() {
  const { setCurrentFunction, currentFunction, setAllFunctionList, allFunctionList } =
    useFunctionStore((store) => store);

  const [keywords, setKeywords] = useState("");

  const { currentApp } = useGlobalStore();

  const { id: functionId } = useParams();
  const navigate = useNavigate();

  useFunctionListQuery({
    onSuccess: (data) => {
      setAllFunctionList(data.data);
      if (!currentFunction?.id && data.data.length > 0) {
        const currentFunction =
          data.data.find((item: TFunction) => item.id === functionId) || data.data[0];
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

  const deleteFunctionMutaion = useDeleteFunctionMutation();

  return (
    <Panel style={{ minHeight: "calc(100vh - 320px)" }}>
      <Panel.Header title={t`FunctionList`} actions={[<CreateModal key="create_modal" />]} />
      <div>
        <div className="flex items-center mb-3">
          <Input
            size="sm"
            rounded={"full"}
            placeholder={String(t("SearchPlacehoder"))}
            onChange={(event) => {
              setKeywords(event.target.value);
            }}
          />
        </div>

        <SectionList style={{ height: "calc(100vh - 400px)", overflowY: "auto" }}>
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
                    <FileTypeIcon type={FileType.js} />
                    <span className="ml-2 text-black">{func?.name}</span>
                  </div>
                  <div className="invisible flex items-center group-hover:visible">
                    <CreateModal functionItem={func} />

                    <ConfirmButton
                      onSuccessAction={async () => {
                        await deleteFunctionMutaion.mutateAsync(func);
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
