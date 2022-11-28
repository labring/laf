/****************************
 * cloud functions list sidebar
 ***************************/

import React, { useEffect, useRef } from "react";
import { CloseIcon, EditIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import useFunctionStore, { TPackage } from "../../store";

import AddDepenceModal from "./AddDepenceModal";

export default function DependecyList() {
  const { getPacakges, allPackages } = useFunctionStore((store) => store);

  const modalRef = useRef<{ edit: (item: TPackage) => void }>();

  useEffect(() => {
    getPacakges();
    return () => {};
  }, [getPacakges]);

  return (
    <div>
      <Panel title="NPM 依赖" actions={[<AddDepenceModal ref={modalRef} key="AddDepenceModal" />]}>
        <SectionList>
          {allPackages?.map((packageItem) => {
            return (
              <SectionList.Item
                isActive={false}
                key={packageItem?.name!}
                onClick={() => {}}
                className="group"
              >
                <div>
                  <FileTypeIcon type={FileType.npm} />
                  <span className="ml-2">{packageItem?.name}</span>
                </div>
                <div className="text-slate-500 ">
                  {packageItem?.version}
                  <span className="ml-3 hidden group-hover:inline-block">
                    <Tooltip label="Edit" placement="top">
                      <EditIcon
                        className="mr-3"
                        fontSize={14}
                        onClick={() => {
                          modalRef.current?.edit(packageItem);
                        }}
                      />
                    </Tooltip>
                    <Tooltip label="Delete" placement="top">
                      <CloseIcon fontSize={10} />
                    </Tooltip>
                  </span>
                </div>
              </SectionList.Item>
            );
          })}
        </SectionList>
      </Panel>
    </div>
  );
}
