import { ChangeEventHandler, useMemo, useState } from "react";
import { DateRange, DayPicker, SelectRangeEventHandler } from "react-day-picker";
import { CalendarIcon } from "@chakra-ui/icons";
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
        "flex h-8 rounded-md border border-grayModern-200",
        !darkMode && "bg-grayModern-100",
      )}
    >
      <Input
        variant={"unstyled"}
        value={fromValue}
        onChange={handleFromChange}
        className="!w-24 !pl-4"
      />
      <Box>-</Box>
      <Input
        variant={"unstyled"}
        value={toValue}
        onChange={handleToChange}
        className="!w-20 !pl-2"
      />
      <Popover onClose={onClose}>
        <PopoverTrigger>
          <Button display={"flex"} variant={"unstyled"}>
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent zIndex={99}>
          <DayPicker
            mode="range"
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
