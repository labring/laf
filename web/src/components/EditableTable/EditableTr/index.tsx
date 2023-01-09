import { useEffect, useState } from "react";
import { FormControl, FormErrorMessage, Input, Td } from "@chakra-ui/react";

import TextButton from "../../TextButton";

import styles from "../index.module.scss";

export type TConfiguration = {
  key: string;
  tableHeight?: string;
  hiddenEditButton?: boolean;
  addButtonText?: string;
  editButtonText?: string;
  deleteButtonText?: string;
  saveButtonText?: string;
  cancelButtonText?: string;
  operationButtonsRender?: (data: any) => any;
};

export type TColumnItem = {
  name: string;
  key: string;
  width?: string;
  textWidth?: string;
  editable?: boolean;
  defaultValue?: string | number | any;
  valiate?: ((
    data: any,
    index: number,
  ) => {
    isValiate: boolean;
    errorInfo: string;
  })[];
  editComponent?: (data: {
    value: any;
    onBlur: (e: any) => any;
    onChange: (e: any) => any;
    disabled: boolean;
  }) => React.ReactElement; //编辑组件
};

const EditableTr = function (props: {
  index: number;
  isCreate?: boolean;
  column: TColumnItem[];
  data: any;
  configuration: TConfiguration;
  onSave: (data: any) => void;
  onCancel: (data: any) => void;
}) {
  const { index, isCreate, data, column, configuration, onSave, onCancel } = props;
  const [formData, setFormData] = useState(data);
  const [invalidData, setInvalidData] = useState<{
    [key: string]: { isValiate: boolean; errorInfo: string };
  }>();

  useEffect(() => {
    setFormData({ ...data });
  }, [data]);

  useEffect(() => {
    const newData: any = {};
    column.forEach((item: TColumnItem) => {
      newData[item.key] = {
        isValiate: true,
        errorInfo: "",
      };
    });
    setInvalidData(newData);
  }, [column]);

  const handleValiate = function (
    key: string,
    value: any,
    valiate:
      | undefined
      | ((
          data: any,
          index: number,
        ) => {
          isValiate: boolean;
          errorInfo: string;
        })[],
  ) {
    const newData = { ...invalidData };
    newData[key] = {
      isValiate: true,
      errorInfo: "",
    };
    for (let method of valiate || []) {
      //  parameter Index: In order to judge whether the new added data
      //  is duplicated with the data in the list
      const { isValiate, errorInfo } = method(value, index);
      if (!isValiate) {
        newData[key] = {
          isValiate,
          errorInfo,
        };
        break;
      }
    }
    setInvalidData(newData);
    return newData[key].isValiate;
  };

  const handleChange = function (
    e: any,
    key: string,
    valiate:
      | undefined
      | ((
          data: any,
          index: number,
        ) => {
          isValiate: boolean;
          errorInfo: string;
        })[],
  ) {
    const newData = { ...formData };
    newData[key] = e.target.value;
    setFormData(newData);
    handleValiate(key, e.target.value, valiate);
  };

  return (
    <>
      {column.map((item: TColumnItem) => {
        const { width, key, editable = true, valiate, editComponent } = item;
        return (
          <Td width={width || undefined} key={key}>
            <FormControl isInvalid={invalidData && !invalidData[key].isValiate}>
              {!editable && !isCreate ? (
                <span className={`w-${item?.textWidth || 40} ${styles.text}`}>{formData[key]}</span>
              ) : editComponent ? (
                editComponent({
                  value: formData[key],
                  onBlur: (e: any) => handleChange(e, key, valiate),
                  onChange: (e: any) => handleChange(e, key, valiate),
                  disabled: !editable && !isCreate,
                })
              ) : (
                <Input
                  resize="vertical"
                  size="sm"
                  value={formData[key]}
                  onBlur={(e: any) => handleChange(e, key, valiate)}
                  onChange={(e: any) => handleChange(e, key, valiate)}
                  disabled={!editable && !isCreate}
                  placeholder={`请输入${key}`}
                />
              )}
              <FormErrorMessage>{invalidData && invalidData[key].errorInfo}</FormErrorMessage>
            </FormControl>
          </Td>
        );
      })}
      <Td width={"200px"}>
        <>
          <TextButton
            text={configuration?.saveButtonText ? configuration.saveButtonText : "确定"}
            type="submit"
            onClick={() => {
              let flag = true;
              for (let { valiate, key } of column) {
                flag = valiate && !handleValiate(key, formData[key], valiate) ? false : flag;
                if (!flag) {
                  break;
                }
              }
              if (flag) {
                onSave(formData);
              }
            }}
          />
          <TextButton
            text={configuration?.cancelButtonText ? configuration.cancelButtonText : "取消"}
            className="ml-4"
            onClick={() => {
              onCancel(formData[configuration.key]);
            }}
          />
        </>
      </Td>
    </>
  );
};
export default EditableTr;
