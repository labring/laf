import { Badge, Spinner } from "@chakra-ui/react";

import { APP_PHASE_STATUS } from "@/constants/index";

import styles from "./index.module.scss";
export default function StatusBadge(props: { statusConditions: APP_PHASE_STATUS }) {
  const { statusConditions } = props;

  return (
    <div className="flex items-center">
      <Badge
        className="py-1 px-4 w-[80px] text-center text-primary-700 mr-2"
        colorScheme={statusConditions === APP_PHASE_STATUS.Started ? "primary" : "blue"}
      >
        <span
          className={`${
            statusConditions === APP_PHASE_STATUS.Started
              ? "before:bg-primary-700"
              : "before:bg-blue-600"
          } ${styles.circle}`}
        >
          {statusConditions}
        </span>
      </Badge>
      {statusConditions === APP_PHASE_STATUS.Started ? "" : <Spinner size="sm" />}
    </div>
  );
}
