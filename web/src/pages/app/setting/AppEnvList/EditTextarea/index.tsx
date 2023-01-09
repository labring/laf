import { Textarea } from "@chakra-ui/react";

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
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      disabled={disabled}
      resize="vertical"
      size="sm"
      placeholder={`请输入${text}`}
    />
  );
};

export default EditTextarea;
