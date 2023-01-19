import React from "react";
import { EditIcon } from "@chakra-ui/icons";
import clsx from "clsx";
import { t } from "i18next";

import IconWrap from "@/components/IconWrap";

import DeleteButton from "./DeleteButton";

const RightPanelList: React.FC<{
  ListQuery?: any;
  setKey: string;
  isActive: (item: any) => Boolean;
  onClick: (data: any) => void;
  deleteRuleMutation: any;
  deleteData?: (item: any) => any;
  component: (item: any) => React.ReactNode;
}> = (props) => {
  const { ListQuery, setKey, component, isActive, onClick, deleteRuleMutation, deleteData } = props;
  return (
    <div className="overflow-y-auto flex-1 overflow-x-hidden pr-1">
      {(ListQuery || [])?.map((item: any, index: number) => {
        return (
          <div
            key={item[setKey]}
            className={clsx("border-2 border-lafWhite-600 p-2 rounded-xl relative group/item", {
              shadow: isActive(item),
              "mb-2": index !== (ListQuery?.data?.data || []).length - 1,
            })}
            onClick={() => {
              onClick(item);
            }}
          >
            <div
              className={clsx(" absolute right-2 top-2  group-hover/item:block z-50 ", {
                hidden: !isActive(item),
              })}
            >
              <div className="flex">
                <DeleteButton
                  data={deleteData ? deleteData(item) : item}
                  deleteMethod={deleteRuleMutation}
                />
                <IconWrap
                  showBg
                  tooltip={t("Edit").toString()}
                  size={32}
                  className="ml-2 hover:bg-rose-100 group/icon"
                >
                  <EditIcon className="group-hover/icon:text-error-500" />
                </IconWrap>
              </div>
            </div>
            {component(item)}
          </div>
        );
      })}
    </div>
  );
};

export default RightPanelList;
