import { useState } from "react";
import { Input, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";
import { t } from "i18next";

export default function InputTag(props: { value: string[]; onChange: (value: string[]) => any }) {
  const { value, onChange } = props;
  const [inputV, setInputV] = useState("");
  const handleEnter = (e: any) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const input = inputV.trim().slice(0, 16);
      if (input !== "" && !value.some((x) => x === input)) {
        onChange([...value, input]);
      }
      setInputV("");
    }
  };
  const handleClose = (item: string) => {
    onChange(value.filter((name) => name !== item));
  };
  return (
    <>
      <Input
        placeholder={String(t("CollectionPanel.CreateTagTip"))}
        className="mb-2"
        value={inputV}
        onKeyDown={(e) => handleEnter(e)}
        onChange={(e) => setInputV(e.target.value)}
      />
      {value.length > 0 ? (
        <div className="flex items-center flex-wrap pb-2 px-2  border-2 rounded border-white-700 border-dashed max-h-20 overflow-auto">
          {value.map((item) => (
            <Tag className="mr-2 mt-2" key={item} variant="inputTag">
              <TagLabel>{item}</TagLabel>
              <TagCloseButton
                onClick={() => {
                  handleClose(item);
                }}
              />
            </Tag>
          ))}
        </div>
      ) : null}
    </>
  );
}
