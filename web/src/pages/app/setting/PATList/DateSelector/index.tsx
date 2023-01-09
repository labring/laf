import { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Input, Select } from "@chakra-ui/react";

import { addDateByValue } from "@/utils/format";

import "react-datepicker/dist/react-datepicker.css";

const DateSelector = function (props: {
  setting: { now: Date; dateList: any[] };
  value: number;
  onChange: (data: any) => any;
}) {
  const { value, onChange, setting } = props;
  const [isShow, setIsShow] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [optionSelect, setOptionSelect] = useState<number | string>(setting.dateList[0].value);
  const ExampleCustomInput = forwardRef(
    (
      props: {
        value?: any;
        onClick?: (data: any) => any;
      },
      ref: any,
    ) => {
      return (
        <Input
          className="ml-4 w-4"
          ref={ref}
          resize="vertical"
          size="sm"
          isReadOnly
          value={props.value}
          onClick={props.onClick}
        />
      );
    },
  );

  const isValiateDay = (date: Date) => {
    const now = new Date();
    const day = date.getTime() - now.getTime();
    return day > 0 && day < 31536000000;
  };

  useEffect(() => {
    if (isShow) {
      setStartDate(addDateByValue(setting.now, value));
    } else {
      setOptionSelect(value);
    }
  }, [value]);

  const handleDateChange = function (date: Date) {
    const timeGap = (date.getTime() - setting.now.getTime()) / 1000;
    onChange({ target: { value: timeGap } });
  };

  const handleSelectChange = function (e: any) {
    if (e.target.value !== "custom") {
      setOptionSelect(e.target.value);
      setIsShow(false);
      onChange(e);
    } else {
      setOptionSelect("custom");
      const initalDate = addDateByValue(setting.now, 120);
      setStartDate(initalDate);
      onChange({ target: { value: 120 } });
      setIsShow(true);
    }
  };

  return (
    <div className="flex">
      <Select width="100px" size="sm" value={optionSelect} onChange={handleSelectChange}>
        {setting.dateList.map((date: any) => (
          <option key={date.value} value={date.value}>
            {date.label}
          </option>
        ))}
      </Select>
      {isShow ? (
        <DatePicker
          dateFormat="yyyy-MM-dd HH:mm"
          selected={startDate}
          customInput={<ExampleCustomInput />}
          filterDate={isValiateDay}
          onChange={handleDateChange}
        />
      ) : null}
    </div>
  );
};

export default DateSelector;
