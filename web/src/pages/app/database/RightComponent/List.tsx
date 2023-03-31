import React from "react";
import clsx from "clsx";

import DeleteButton from "./DeleteButton";

const RightPanelList: React.FC<{
  ListQuery?: any;
  setKey: string;
  isActive: (item: any) => Boolean;
  onClick: (data: any) => void;
  deleteRuleMutation: any;
  deleteData?: (item: any) => any;
  customStyle?: any;
  toolComponent?: (item: any) => React.ReactNode;
  component: (item: any) => React.ReactNode;
}> = (props) => {
  const {
    ListQuery,
    setKey,
    component,
    toolComponent,
    isActive,
    onClick,
    deleteRuleMutation,
    deleteData,
    customStyle,
  } = props;
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
      {(ListQuery || [])?.map((item: any, index: number) => {
        return (
          <div
            key={item[setKey]}
            className={clsx("group/item relative rounded-xl border-2 p-2", {
              ...customStyle,
              shadow: isActive(item),
              "mb-2": index !== (ListQuery?.data?.data || []).length - 1,
            })}
            onClick={() => {
              onClick(item);
            }}
          >
            <div
              className={clsx(" absolute right-2 top-2  z-50 group-hover/item:block ", {
                hidden: !isActive(item),
              })}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex">
                <DeleteButton
                  data={deleteData ? deleteData(item) : item}
                  deleteMethod={deleteRuleMutation}
                />
                {toolComponent && toolComponent(item)}
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
