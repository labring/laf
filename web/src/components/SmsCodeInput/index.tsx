import { useRef } from "react";
import { Input, useColorMode } from "@chakra-ui/react";
const CODE_NUMBER = 6;

export default function SmsCodeInput(props: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { value, onChange } = props;
  const inputsRefs = useRef<Array<HTMLInputElement | null>>([]);
  const darkMode = useColorMode().colorMode === "dark";

  if (value) {
    const updatedValues = value.split("").slice(0, CODE_NUMBER);
    inputsRefs.current.forEach((input, index) => {
      if (input) {
        input.value = updatedValues[index] || "";
      }
    });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value;
    if (index < CODE_NUMBER - 1 && inputValue.length === 1) {
      inputsRefs.current[index + 1]?.focus();
    }
    const updatedValue = updateValueAtIndex(value, index, inputValue);
    if (onChange) {
      onChange(updatedValue);
    }
  };

  const updateValueAtIndex = (value: string | undefined, index: number, newValue: string) => {
    if (value === undefined) {
      return newValue;
    }
    const newValueArray = value.split("");
    newValueArray[index] = newValue;
    return newValueArray.join("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (index > 0 && e.key === "Backspace") {
      const inputValue = e.currentTarget.value;
      if (inputValue === "") {
        inputsRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.Clipboard;
    const pastedText = clipboardData.getData("text").slice(0, CODE_NUMBER);
    const updatedValues = Array.from({ length: CODE_NUMBER }, (_, i) => pastedText[i] || "");

    inputsRefs.current.forEach((input, index) => {
      if (input) {
        input.value = updatedValues[index];
        handleInputChange({ target: input } as React.ChangeEvent<HTMLInputElement>, index);
      }
    });

    const updatedValue = updatedValues.join("");
    if (onChange) {
      onChange(updatedValue);
    }
  };

  const renderInputs = () => {
    const inputs = [];
    for (let i = 0; i < CODE_NUMBER; i++) {
      inputsRefs.current[i] = inputsRefs.current[i] ?? null;
      inputs.push(
        <Input
          key={i}
          value={value?.charAt(i) ?? ""}
          type="text"
          maxLength={1}
          onChange={(e) => handleInputChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          width={"30px"}
          height={"32px"}
          bg={!darkMode ? "#F8FAFB" : "none"}
          border={"1px solid #D5D6E1"}
          padding={0}
          className="text-center"
          ref={(ref) => (inputsRefs.current[i] = ref)}
        />,
      );
      if (i === CODE_NUMBER / 2 - 1) {
        inputs.push(<div key="divider" className="h-[1px] w-5 bg-[#D5D6E1]" />);
      }
    }
    return inputs;
  };

  return <div className="flex items-center justify-between">{renderInputs()}</div>;
}
