import { useTranslation } from "react-i18next";
import { HStack } from "@chakra-ui/react";
import clsx from "clsx";

import { DeleteIcon } from "@/components/CommonIcon";
import Panel from "@/components/Panel";

import Icons from "../SideBar/Icons";

import RecycleBinModal from "./RecycleBinModal";

import SysSetting from "@/pages/app/setting/SysSetting";
import useGlobalStore from "@/pages/globalStore";
import CreateAppModal from "@/pages/home/mods/CreateAppModal";
import StatusBadge from "@/pages/home/mods/StatusBadge";

function StatusBar() {
  const { t } = useTranslation();
  const { currentApp } = useGlobalStore((state) => state);

  return (
    <Panel className="!flex-row justify-between">
      <HStack spacing={2}>
        <div>
          {t("StatusBar.CurrentApplication")}: {currentApp?.name}
        </div>
        <SysSetting>
          <div className="cursor-pointer">
            <Icons type="info" />
          </div>
        </SysSetting>
        <StatusBadge statusConditions={currentApp?.phase} state={currentApp?.state} />
      </HStack>
      <HStack spacing={4}>
        <div>CPU: {`${currentApp?.bundle?.resource?.limitCPU! / 1000} ${t("Unit.CPU")}`}</div>
        <div>
          {t("Spec.RAM")}: {`${currentApp?.bundle?.resource.limitMemory} ${t("Unit.MB")}`}
        </div>
        <div className={clsx("mt-1")}>
          <CreateAppModal application={currentApp as any} type="change">
            <a className="ml-2 text-primary-500" href="/edit">
              {t("Change")}
            </a>
          </CreateAppModal>
        </div>
        <RecycleBinModal>
          <div className="flex cursor-pointer items-center text-grayModern-500">
            <DeleteIcon boxSize={4} />
            {t("RecycleBin")}
          </div>
        </RecycleBinModal>
      </HStack>
    </Panel>
  );
}

export default StatusBar;
