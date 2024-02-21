import { ChangeEventHandler, useMemo, useState } from "react";
import { DateRange, DayPicker, SelectRangeEventHandler } from "react-day-picker";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { format, isAfter, isBefore, isValid, parse } from "date-fns";
import { es, zhCN } from "date-fns/locale";

import { CalendarIcon } from "../CommonIcon";

import "./index.css";
import "react-day-picker/dist/style.css";

export default function DateRangePicker(props: {
  setStartTime: any;
  setEndTime: any;
  startTime: any;
  endTime: any;
}) {
  const { setStartTime, setEndTime, startTime, endTime } = props;
  const initState = useMemo(() => ({ from: startTime, to: endTime }), [startTime, endTime]);
  const [selectedRange, setSelectedRange] = useState<DateRange>(initState);
  const [fromValue, setFromValue] = useState<string>(format(initState.from, "y-MM-dd"));
  const [toValue, setToValue] = useState<string>(format(initState.to, "y-MM-dd"));
  const darkMode = useColorMode().colorMode === "dark";
  const { i18n } = useTranslation();
  const onClose = () => {
    selectedRange.from && setStartTime(selectedRange.from);
    selectedRange.to && setEndTime(selectedRange.to);
  };
  const handleFromChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFromValue(e.target.value);
    const date = parse(e.target.value, "y-MM-dd", new Date());
    if (!isValid(date)) {
      return setSelectedRange({ from: undefined, to: undefined });
    }
    if (selectedRange?.to && isAfter(date, selectedRange.to)) {
      setSelectedRange({ from: selectedRange.to, to: date });
    } else {
      setSelectedRange({ from: date, to: selectedRange?.to });
    }
  };

  const handleToChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setToValue(e.target.value);
    const date = parse(e.target.value, "y-MM-dd", new Date());

    if (!isValid(date)) {
      return setSelectedRange({ from: selectedRange?.from, to: undefined });
    }
    if (selectedRange?.from && isBefore(date, selectedRange.from)) {
      setSelectedRange({ from: date, to: selectedRange.from });
    } else {
      setSelectedRange({ from: selectedRange?.from, to: date });
    }
  };

  const handleRangeSelect: SelectRangeEventHandler = (range: DateRange | undefined) => {
    if (range) {
      setSelectedRange(range);
      if (range?.from) {
        setFromValue(format(range.from, "y-MM-dd"));
      } else {
        setFromValue("");
      }
      if (range?.to) {
        setToValue(format(range.to, "y-MM-dd"));
      } else {
        setToValue("");
      }
    }
  };
  return (
    <div
      className={clsx(
        "flex h-8 w-64 rounded-md border border-frostyNightfall-200",
        !darkMode && "bg-lafWhite-500",
      )}
    >
      <Input
        variant={"unstyled"}
        value={fromValue}
        onChange={handleFromChange}
        className="flex-1 text-center"
      />
      <Box>-</Box>
      <Input
        variant={"unstyled"}
        value={toValue}
        onChange={handleToChange}
        className="flex-1 text-center"
      />
      <Popover onClose={onClose}>
        <PopoverTrigger>
          <Button variant="none" px={0} mr={2} minW={4}>
            <CalendarIcon className="pb-[2px] !text-grayModern-500" fontSize="18" />
          </Button>
        </PopoverTrigger>
        <PopoverContent zIndex={99}>
          <DayPicker
            mode="range"
            locale={i18n.language === "en" ? es : zhCN}
            selected={selectedRange}
            onSelect={handleRangeSelect}
            styles={{
              day: {
                transition: "all 0.2s ease-in-out",
                borderRadius: "unset",
              },
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
