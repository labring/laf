import React from "react";
import { DeleteIcon } from "@chakra-ui/icons";

import ConfirmButton from "@/components/ConfirmButton";
import IconWrap from "@/components/IconWrap";

import useStorageStore from "../../store";

function AlertDialogExample(props: { storage: any }) {
  const { storage } = props;
  const { deleteStorage } = useStorageStore((state) => state);
  return (
    <ConfirmButton
      onSuccessAction={() => {
        deleteStorage(storage);
      }}
      headerText="Delete Customer"
      bodyText="Are you sure? You can't undo this action afterwards."
    >
      <IconWrap>
        <DeleteIcon fontSize={12} />
      </IconWrap>
    </ConfirmButton>
  );
}

export default AlertDialogExample;
