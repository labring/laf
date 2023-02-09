import { Badge, Spinner } from "@chakra-ui/react";
import clsx from "clsx";

import { APP_PHASE_STATUS } from "@/constants/index";
const bgColor = {
  [APP_PHASE_STATUS.Started]: "bg-primary-600",
  [APP_PHASE_STATUS.Creating]: "bg-warn-600",
  [APP_PHASE_STATUS.Starting]: "bg-blue-600",
  [APP_PHASE_STATUS.Deleting]: "bg-error-600",
  [APP_PHASE_STATUS.Restarting]: "bg-blue-600",
  [APP_PHASE_STATUS.Created]: "bg-blue-600",
};
export default function StatusBadge(props: { statusConditions: APP_PHASE_STATUS }) {
  const { statusConditions } = props;

  return (
    <div className="flex items-center">
      <Badge className="py-1 px-4 w-[80px] text-center mr-2" variant={statusConditions}>
        <span
          className={clsx(
            bgColor[statusConditions],
            " inline-block w-[6px] h-[6px] rounded-full mr-1",
          )}
        ></span>
        {statusConditions}
      </Badge>
      {statusConditions === APP_PHASE_STATUS.Started ? "" : <Spinner size="sm" />}
    </div>
  );
}
