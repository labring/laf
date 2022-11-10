/****************************
 * cloud functions list sidebar
 ***************************/

import React, { useEffect } from "react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import useFunctionStore from "../../store";

import AddDepenceModal from "./AddDepenceModal";

export default function DependecyList() {
  const { getPacakges, allPackages } = useFunctionStore((store) => store);

  useEffect(() => {
    getPacakges();
    return () => {};
  }, [getPacakges]);

  return (
    <div>
      <Panel title="NPM 依赖" actions={[<AddDepenceModal key="AddDepenceModal" />]}>
        <SectionList>
          {allPackages?.map((packageItem) => {
            return (
              <SectionList.Item isActive={false} key={packageItem?.name!} onClick={() => {}}>
                <div>
                  <FileTypeIcon type={FileType.npm} />
                  <span className="ml-2">{packageItem?.name}</span>
                </div>
                <div className="text-slate-500">{packageItem?.version}</div>
              </SectionList.Item>
            );
          })}
        </SectionList>
      </Panel>
    </div>
  );
}
