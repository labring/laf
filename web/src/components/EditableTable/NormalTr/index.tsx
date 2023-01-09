import { Td } from "@chakra-ui/react";
import { t } from "i18next";

import ConfirmButton from "../../ConfirmButton";
import TextButton from "../../TextButton";
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
          <Td width={item?.width} key={item.key}>
            <span className={`w-${item.textWidth} ${styles.text}`}>{data[item.key]}</span>
          </Td>
        );
      })}
      <Td width={"200px"}>
        <>
          {configuration?.operationButtonsRender
            ? configuration.operationButtonsRender(data)
            : null}
          {!configuration?.hiddenEditButton ? (
            <TextButton
              className="mr-4"
              text={configuration?.editButtonText ? configuration.editButtonText : "编辑"}
              onClick={() => onEdit(data[configuration.key])}
            />
          ) : null}
          <ConfirmButton
            onSuccessAction={() => onDelete(data[configuration.key])}
            headerText={
              configuration?.deleteButtonText ? configuration.deleteButtonText : String(t("Delete"))
            }
            bodyText={`确定删除该行数据吗?`}
          >
            <TextButton
              text={
                configuration?.deleteButtonText
                  ? configuration.deleteButtonText
                  : String(t("Delete"))
              }
            />
          </ConfirmButton>
        </>
      </Td>
    </>
  );
};

export default NormalTr;
