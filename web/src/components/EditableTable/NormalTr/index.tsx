import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Td } from "@chakra-ui/react";
import { t } from "i18next";

import IconWrap from "@/components/IconWrap";

import ConfirmButton from "../../ConfirmButton";
import { TColumnItem, TConfiguration } from "../EditableTr";

import styles from "../index.module.scss";

const NormalTr = function (props: {
  column: TColumnItem[];
  data: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  configuration: TConfiguration;
}) {
  const { data, column, configuration, onEdit, onDelete } = props;
  return (
    <>
      {column.map((item: TColumnItem) => {
        return (
          <Td maxWidth={item?.width} key={item.key} className={`${styles.text}`}>
            <span>{data[item.key]}</span>
          </Td>
        );
      })}
      <Td maxWidth="150px" className="flex">
        <>
          {configuration?.operationButtonsRender
            ? configuration.operationButtonsRender(data)
            : null}
          {!configuration?.hiddenEditButton ? (
            <IconWrap
              className="mr-2"
              tooltip={
                configuration?.editButtonText ? configuration.editButtonText : t("Edit").toString()
              }
              size={20}
            >
              <EditIcon fontSize={15} onClick={() => onEdit(data[configuration.key])} />
            </IconWrap>
          ) : null}
          <ConfirmButton
            onSuccessAction={() => onDelete(data[configuration.key])}
            headerText={
              configuration?.deleteButtonText ? configuration.deleteButtonText : String(t("Delete"))
            }
            bodyText={t("DeleteConfirm")}
          >
            <IconWrap
              tooltip={
                configuration?.deleteButtonText
                  ? configuration.deleteButtonText
                  : String(t("Delete"))
              }
            >
              <DeleteIcon fontSize={15} />
            </IconWrap>
          </ConfirmButton>
        </>
      </Td>
    </>
  );
};

export default NormalTr;
