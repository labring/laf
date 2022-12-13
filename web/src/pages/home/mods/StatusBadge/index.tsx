import React from "react";
import { Badge, Spinner } from "@chakra-ui/react";

import { APP_PHASE_STATUS } from "@/constants/index";

export default function StatusBadge(props: { statusConditions: APP_PHASE_STATUS }) {
  const { statusConditions } = props;

  return (
    <div className="flex items-center">
      状态:
      <Badge
        className="ml-2 mr-2"
        colorScheme={statusConditions === APP_PHASE_STATUS.Started ? "green" : "blue"}
      >
        {statusConditions}
      </Badge>
      {statusConditions === APP_PHASE_STATUS.Started ? "" : <Spinner size="sm" />}
    </div>
  );
}
