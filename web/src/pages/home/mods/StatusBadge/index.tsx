import { Badge, Spinner } from "@chakra-ui/react";
import clsx from "clsx";

import { APP_PHASE_STATUS } from "@/constants/index";

import styles from "./index.module.scss";
export default function StatusBadge(props: { statusConditions: APP_PHASE_STATUS }) {
  const { statusConditions } = props;

  return (
    <div className="flex items-center">
      <Badge className="py-1 px-4 w-[80px] text-center mr-2" variant={statusConditions}>
        <span
          className={clsx(
            {
              "before:bg-primary-600": statusConditions === APP_PHASE_STATUS.Started,
              "before:bg-warn-600": statusConditions === APP_PHASE_STATUS.Creating,
              "before:bg-blue-600": statusConditions === APP_PHASE_STATUS.Starting,
              "before:bg-error-600": statusConditions === APP_PHASE_STATUS.Deleting,
            },
            styles.circle,
          )}
        >
          {statusConditions}
        </span>
      </Badge>
      {statusConditions === APP_PHASE_STATUS.Started ? "" : <Spinner size="sm" />}
    </div>
  );
}
