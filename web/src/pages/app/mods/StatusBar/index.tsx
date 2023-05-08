import { useTranslation } from "react-i18next";
import { HStack } from "@chakra-ui/react";
import clsx from "clsx";
import dayjs from "dayjs";

import Panel from "@/components/Panel";
import { formatDate } from "@/utils/format";

import Icons from "../SideBar/Icons";

import SysSetting from "@/pages/app/setting/SysSetting";
import useGlobalStore from "@/pages/globalStore";
import CreateAppModal from "@/pages/home/mods/CreateAppModal";
import StatusBadge from "@/pages/home/mods/StatusBadge";

function StatusBar() {
  const { t } = useTranslation();
  const { currentApp } = useGlobalStore((state) => state);

  return (
    <Panel className="!flex-row justify-between">
      <HStack px={3} py={2} spacing={4}>
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
      <HStack px={3} py={2} spacing={4}>
        <div>CPU: {`${currentApp?.bundle?.resource?.limitCPU! / 1000} ${t("Unit.CPU")}`}</div>
        <div>
          {t("Spec.RAM")}: {`${currentApp?.bundle?.resource.limitMemory} ${t("Unit.MB")}`}
        </div>
        <div
          className={clsx(
            "mt-1",
            dayjs().add(3, "day").isAfter(dayjs(currentApp?.subscription.expiredAt))
              ? "text-red-500"
              : "",
          )}
        >
          {t("EndTime")}: {formatDate(currentApp?.subscription.expiredAt)}
          <CreateAppModal application={currentApp as any} type="renewal">
            <a className="ml-2 text-primary-500" href="/edit">
              {t("Renew")}
            </a>
          </CreateAppModal>
        </div>
      </HStack>
    </Panel>
  );
}

export default StatusBar;
