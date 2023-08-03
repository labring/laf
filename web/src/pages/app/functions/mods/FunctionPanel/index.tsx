/****************************
 * cloud functions list sidebar
 ***************************/

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddIcon, DeleteIcon, EditIcon, Search2Icon } from "@chakra-ui/icons";
import { Badge, HStack, Input, InputGroup, InputLeftElement, useColorMode } from "@chakra-ui/react";
import { clsx } from "clsx";
import { t } from "i18next";

import { TriggerIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import EmptyBox from "@/components/EmptyBox";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import IconText from "@/components/IconText";
import IconWrap from "@/components/IconWrap";
import MoreButton from "@/components/MoreButton";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";
import { COLOR_MODE, Pages } from "@/constants";

import { useDeleteFunctionMutation, useFunctionListQuery } from "../../service";
import useFunctionStore from "../../store";
import TriggerModal from "../TriggerModal";

import CreateModal from "./CreateModal";

import { TFunction } from "@/apis/typing";
import useFunctionCache from "@/hooks/useFunctionCache";
import useGlobalStore from "@/pages/globalStore";

type TagItem = {
  tagName: string;
  selected: boolean;
};

type TreeNode = {
  _id: string;
  name: string;
  level?: number;
  isExpanded?: boolean;
  children: (TreeNode | TFunction)[];
};

export default function FunctionList() {
  const {
    setCurrentFunction,
    currentFunction,
    setAllFunctionList,
    allFunctionList,
    recentFunctionList,
    setRecentFunctionList,
  } = useFunctionStore((store) => store);

  const functionCache = useFunctionCache();
  const [root, setRoot] = useState<TreeNode>({ _id: "", name: "", children: [] });

  const [keywords, setKeywords] = useState("");

  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const { currentApp, showSuccess } = useGlobalStore();

  const { id: functionName } = useParams();
  const navigate = useNavigate();
  const [tagsList, setTagsList] = useState<TagItem[]>([]);

  const [currentTag, setCurrentTag] = useState<TagItem | null>(null);

  const filterFunctions = allFunctionList.filter((item: TFunction) => {
    let flag = item?.name.includes(keywords);
    if (tagsList.length > 0 && currentTag) {
      flag = flag && item.tags.includes(currentTag?.tagName);
    }
    return flag;
  });

  function generateRoot(data: TFunction[]) {
    const root = { _id: "", name: "", level: 0, isExpanded: true, children: [] };
    data.forEach((item) => {
      const nameParts = item.name.split("/");
      let currentNode: TreeNode = root;
      nameParts.forEach((part, index) => {
        if (index === nameParts.length - 1) {
          currentNode.children.push(item);
          return;
        }
        let existingNode = currentNode.children.find(
          (node) => node.name === part && (node as TreeNode).level === index,
        );
        if (!existingNode) {
          const newNode = {
            _id: item._id,
            name: part,
            level: index,
            isExpanded: false,
            children: [],
          };
          currentNode.children.push(newNode);
          existingNode = newNode;
        }
        currentNode = existingNode as TreeNode;
      });
    });
    return root;
  }

  useFunctionListQuery({
    onSuccess: (data) => {
      setAllFunctionList(data.data);
      setRoot(generateRoot(data.data));
      const tags = data.data.reduce((pre: any, item: any) => {
        return pre.concat(item.tags);
      }, []);
      let newTags: TagItem[] = Array.from(new Set(tags)).map((tagName: any) => {
        const oldTag = tagsList.filter((tag) => tag.tagName === tagName);
        return oldTag.length > 0
          ? oldTag[0]
          : {
              tagName: tagName,
              selected: false,
            };
      });
      setTagsList(newTags);

      if (!currentFunction?._id && data.data.length > 0) {
        const currentFunction =
          data.data.find((item: TFunction) => item.name === functionName) || data.data[0];
        setCurrentFunction(currentFunction);
        if (!recentFunctionList.map((item) => item._id).includes(currentFunction._id)) {
          setRecentFunctionList([currentFunction, ...recentFunctionList]);
        }
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

  const renderSelectedTags = () => {
    return tagsList.length > 0 ? (
      <div className="mb-2 flex w-full min-w-[200px] flex-wrap items-center justify-start border-b pb-1">
        <p className={clsx("mb-1 mr-2", darkMode ? "text-white-500" : "text-grayModern-500")}>
          {t("FunctionPanel.Tags")}
        </p>
        {tagsList.map((item) => (
          <span
            className={clsx(
              "mb-1 mr-1 cursor-pointer rounded px-2",
              darkMode ? "bg-gray-700" : "bg-gray-100",
              {
                "!bg-primary-400 text-white": item.tagName === currentTag?.tagName,
              },
            )}
            key={item.tagName}
            onClick={() => setCurrentTag(currentTag?.tagName === item.tagName ? null : item)}
          >
            {item.tagName}
          </span>
        ))}
      </div>
    ) : null;
  };

  function renderSectionItems(items: TreeNode[], isFuncList = false) {
    items.sort((a: TreeNode, b: TreeNode) => {
      const isFolderA = a.children && a.children.length > 0;
      const isFolderB = b.children && b.children.length > 0;
      if (isFolderA && !isFolderB) {
        return -1;
      } else if (!isFolderA && isFolderB) {
        return 1;
      }
      return 0;
    });

    return items.map((item, index) => {
      let fileType = FileType.ts;
      if (item.children?.length) {
        fileType = FileType.folder;
      }
      const level = item.level || item?.name.split("/").length - 1;

      return (
        <React.Fragment key={index}>
          <SectionList.Item
            isActive={item?.name === currentFunction?.name && !item.children?.length}
            key={index as any}
            className="group"
            onClick={() => {
              if (!item?.children?.length) {
                setCurrentFunction(item);
                if (!recentFunctionList.map((item) => item._id).includes(item._id)) {
                  setRecentFunctionList([item as unknown as TFunction, ...recentFunctionList]);
                }
                navigate(`/app/${currentApp?.appid}/${Pages.function}/${item?.name}`);
              } else {
                item.isExpanded = !item.isExpanded;
                setRoot({ ...root });
              }
            }}
          >
            <div
              className={clsx(
                "overflow-hidden text-ellipsis whitespace-nowrap",
                !isFuncList ? `ml-${2 * level}` : "",
              )}
            >
              <FileTypeIcon type={fileType} width="12px" />
              <span className="ml-2 text-base">
                {item.children?.length || isFuncList ? item?.name : item?.name.split("/")[level]}
              </span>
            </div>
            {!item.children?.length && (
              <HStack spacing={1}>
                {functionCache.getCache(item?._id, (item as any)?.source?.code) !==
                  (item as any)?.source?.code && (
                  <span className="mt-[1px] inline-block h-1 w-1 flex-none rounded-full bg-rose-500"></span>
                )}
                <MoreButton isHidden={item.name !== currentFunction?.name} label={t("Operation")}>
                  <>
                    <CreateModal functionItem={item} tagList={tagsList}>
                      <IconText icon={<EditIcon />} text={t("Edit")} />
                    </CreateModal>
                    <ConfirmButton
                      onSuccessAction={async () => {
                        const res = await deleteFunctionMutation.mutateAsync(item);
                        if (!res.error) {
                          showSuccess(t("DeleteSuccess"));
                        }
                      }}
                      headerText={String(t("Delete"))}
                      bodyText={String(t("FunctionPanel.DeleteConfirm"))}
                    >
                      <IconText
                        icon={<DeleteIcon />}
                        text={t("Delete")}
                        className="hover:!text-error-600"
                      />
                    </ConfirmButton>
                  </>
                </MoreButton>
              </HStack>
            )}
          </SectionList.Item>
          {item.isExpanded &&
            item?.children?.length &&
            renderSectionItems(item.children as TreeNode[])}
        </React.Fragment>
      );
    });
  }

  return (
    <Panel className="min-w-[215px] flex-grow overflow-hidden">
      <Panel.Header
        title={
          <div className="flex">
            {t`FunctionPanel.FunctionList`}
            {filterFunctions.length ? (
              <Badge rounded={"full"} ml="1">
                {filterFunctions.length}
              </Badge>
            ) : null}
          </div>
        }
        actions={[
          <TriggerModal key="trigger_modal">
            <IconWrap size={20} tooltip={t("TriggerPanel.Trigger").toString()}>
              <TriggerIcon fontSize={13} />
            </IconWrap>
          </TriggerModal>,
          <CreateModal key="create_modal" tagList={tagsList}>
            <IconWrap size={20} tooltip={t("FunctionPanel.AddFunction").toString()}>
              <AddIcon fontSize={12} />
            </IconWrap>
          </CreateModal>,
        ]}
      />

      <InputGroup className="mb-2">
        <InputLeftElement
          height={"6"}
          pointerEvents="none"
          children={<Search2Icon color="gray.300" fontSize={12} />}
        />
        <Input
          size="xs"
          pl={8}
          rounded={"full"}
          placeholder={String(t("FunctionPanel.SearchPlaceholder"))}
          onChange={(e) => {
            setKeywords(e.target.value);
          }}
        />
      </InputGroup>

      {renderSelectedTags()}

      <div className="flex-grow" style={{ overflowY: "auto" }}>
        {keywords || currentTag ? (
          <SectionList>
            {renderSectionItems(filterFunctions as unknown as TreeNode[], true)}
          </SectionList>
        ) : root.children?.length ? (
          <SectionList>{renderSectionItems(root.children as TreeNode[])}</SectionList>
        ) : (
          <EmptyBox hideIcon>
            <p>{t("FunctionPanel.EmptyFunctionTip")}</p>
          </EmptyBox>
        )}
      </div>
    </Panel>
  );
}
