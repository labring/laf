import { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Input, Select } from "@chakra-ui/react";
import clsx from "clsx";

import { addDateByValue } from "@/utils/format";

import "react-datepicker/dist/react-datepicker.css";
import styles from "./index.module.scss";

const DateSelector = function (props: {
  setting: { now: Date; dateList: any[] };
  value: number;
  onChange: (data: any) => any;
}) {
  const { value, onChange, setting } = props;
  const [isShow, setIsShow] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [optionSelect, setOptionSelect] = useState<number | string>(setting.dateList[0].value);
  const CustomInput = forwardRef(
    (
      props: {
        value?: any;
        onClick?: (data: any) => any;
      },
      ref: any,
    ) => {
      return (
        <Input
          className="ml-4"
          style={{ width: "130px" }}
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

  const isValidateDay = (date: Date) => {
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
  }, [value, isShow, setting, setStartDate, setOptionSelect]);

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
      const initialDate = addDateByValue(setting.now, 120);
      setStartDate(initialDate);
      onChange({ target: { value: 120 } });
      setIsShow(true);
    }
  };

  return (
    <div className={clsx(styles.customStyleDateSelector, " flex")}>
      <Select
        variant="filled"
        width={isShow ? "120px" : "190px"}
        size="sm"
        value={optionSelect}
        onChange={handleSelectChange}
      >
        {setting.dateList.map((date: any) => (
          <option key={date.value} value={date.value}>
            {date.label}
          </option>
        ))}
      </Select>
      {isShow ? (
        <DatePicker
          calendarClassName="customStyle"
          dateFormat="yyyy/MM/dd HH:mm"
          selected={startDate}
          customInput={<CustomInput />}
          filterDate={isValidateDay}
          onChange={handleDateChange}
        />
      ) : null}
    </div>
  );
};

export default DateSelector;
