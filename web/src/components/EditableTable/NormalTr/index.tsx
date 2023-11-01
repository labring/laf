import { Td } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { t } from "i18next";

import { EditIconLine, RecycleDeleteIcon } from "@/components/CommonIcon";
import IconWrap from "@/components/IconWrap";

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
  const darkMode = useColorMode().colorMode === "dark";
  return (
    <>
      {column.map((item: TColumnItem) => {
        return (
          <Td maxWidth={item?.width} key={item.key} className={`${styles.text}`}>
            <span>{data[item.key]}</span>
          </Td>
        );
      })}
      <Td className="mr-4 flex items-end justify-end">
        {configuration?.operationButtonsRender ? configuration.operationButtonsRender(data) : null}
        {!configuration?.hiddenEditButton ? (
          <IconWrap
            className="mr-4"
            tooltip={
              configuration?.editButtonText ? configuration.editButtonText : t("Edit").toString()
            }
            size={20}
            onClick={() => onEdit(data[configuration.key])}
          >
            <EditIconLine color={darkMode ? "white" : "black"} size={12} />
          </IconWrap>
        ) : null}
        <IconWrap
          tooltip={
            configuration?.deleteButtonText ? configuration.deleteButtonText : String(t("Delete"))
          }
          onClick={() => onDelete(data[configuration.key])}
        >
          <RecycleDeleteIcon fontSize={15} />
        </IconWrap>
      </Td>
    </>
  );
};

export default NormalTr;
