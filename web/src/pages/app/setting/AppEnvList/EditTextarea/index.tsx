import { Textarea } from "@chakra-ui/react";
import { t } from "i18next";

const EditTextarea = function (props: {
  text: string;
  value: number;
  onChange: (data: any) => any;
  onBlur: (data: any) => any;
  disabled: boolean;
}) {
  const { text, value, onBlur, onChange, disabled } = props;
  return (
    <Textarea
      className="focus-visible:border-0 bg-lafWhite-600"
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      disabled={disabled}
      resize="vertical"
      size="sm"
      placeholder={`${t("InputTip")} ${text}`}
    />
  );
};

export default EditTextarea;
