import { useEffect, useState } from "react";
import { FormControl, FormErrorMessage, Input, Td } from "@chakra-ui/react";
import { t } from "i18next";

import TextButton from "../../TextButton";
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
  editable?: boolean;
  defaultValue?: string | number | any;
  validate?: ((
    data: any,
    index: number,
  ) => {
    isValidate: boolean;
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
    [key: string]: { isValidate: boolean; errorInfo: string };
  }>();

  useEffect(() => {
    setFormData({ ...data });
  }, [data]);

  useEffect(() => {
    const newData: any = {};
    column.forEach((item: TColumnItem) => {
      newData[item.key] = {
        isValidate: true,
        errorInfo: "",
      };
    });
    setInvalidData(newData);
  }, [column]);

  const handleValidate = function (
    key: string,
    value: any,
    validate:
      | undefined
      | ((
          data: any,
          index: number,
        ) => {
          isValidate: boolean;
          errorInfo: string;
        })[],
  ) {
    const newData = { ...invalidData };
    newData[key] = {
      isValidate: true,
      errorInfo: "",
    };
    for (let method of validate || []) {
      //  parameter Index: In order to judge whether the new added data
      //  is duplicated with the data in the list
      const { isValidate, errorInfo } = method(value, index);
      if (!isValidate) {
        newData[key] = {
          isValidate: isValidate,
          errorInfo,
        };
        break;
      }
    }
    setInvalidData(newData);
    return newData[key].isValidate;
  };

  const handleChange = function (
    e: any,
    key: string,
    validate:
      | undefined
      | ((
          data: any,
          index: number,
        ) => {
          isValidate: boolean;
          errorInfo: string;
        })[],
  ) {
    const newData = { ...formData };
    newData[key] = e.target.value;
    setFormData(newData);
    handleValidate(key, e.target.value, validate);
  };

  return (
    <>
      {column.map((item: TColumnItem) => {
        const { width, key, editable = true, validate, editComponent } = item;
        return (
          <Td maxWidth={width || undefined} key={key}>
            <FormControl isInvalid={invalidData && !invalidData[key].isValidate}>
              {editComponent ? (
                editComponent({
                  value: formData[key],
                  onBlur: (e: any) => handleChange(e, key, validate),
                  onChange: (e: any) => handleChange(e, key, validate),
                  disabled: !editable && !isCreate,
                })
              ) : (
                <Input
                  resize="vertical"
                  size="sm"
                  value={formData[key]}
                  onBlur={(e: any) => handleChange(e, key, validate)}
                  onChange={(e: any) => handleChange(e, key, validate)}
                  disabled={!editable && !isCreate}
                  placeholder={`${t("InputTip").toString()} ${key}`}
                />
              )}
              <FormErrorMessage>{invalidData && invalidData[key].errorInfo}</FormErrorMessage>
            </FormControl>
          </Td>
        );
      })}
      <Td maxWidth="150px">
        <>
          <TextButton
            text={configuration?.saveButtonText ? configuration.saveButtonText : t("Confirm")}
            type="submit"
            onClick={() => {
              let flag = true;
              for (let { validate, key } of column) {
                flag = validate && !handleValidate(key, formData[key], validate) ? false : flag;
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
            text={configuration?.cancelButtonText ? configuration.cancelButtonText : t("Cancel")}
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
