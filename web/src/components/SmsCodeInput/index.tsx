import { useRef } from "react";
import { Input } from "@chakra-ui/react";
const CODE_NUMBER = 6;

export default function SmsCodeInput(props: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { value, onChange } = props;
  const inputsRefs = useRef<Array<HTMLInputElement | null>>([]);

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
          width={"30px"}
          height={"32px"}
          bg={"#F8FAFB"}
          border={"1px solid #D5D6E1"}
          padding={0}
          className="text-center"
          ref={(ref) => (inputsRefs.current[i] = ref)}
        />,
      );
      if (i === CODE_NUMBER / 2 - 1) {
        inputs.push(<div className="h-[1px] w-5 bg-[#D5D6E1]" />);
      }
    }
    return inputs;
  };

  return <div className="flex items-center justify-between">{renderInputs()}</div>;
}
