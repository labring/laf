import dayjs from "dayjs";
import { t } from "i18next";

export function formatDate(
  date?: string | number | Date | dayjs.Dayjs | null | undefined,
  format = "YYYY-MM-DD HH:mm",
) {
  return dayjs(date).format(format);
}

export function formatSize(size: number) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = 0;
  while (size >= 1024) {
    size /= 1024;
    i++;
  }
  return size.toFixed(2) + " " + units[i];
}

export function formateType(name: string | undefined) {
  const nameList = name?.split(".");
  if (nameList?.length && nameList.length === 2) {
    return nameList[1];
  } else {
    return "file";
  }
}

export function formatCapacity(capacity: string) {
  const num = capacity.split("Gi")[0];
  return parseInt(num, 10);
}

export function formatDateOption(): { label: string; value: number | string }[] {
  const optionDay = [7, 30, 60, 90];
  const option: { label: string; value: string | number }[] = optionDay.map((item) => {
    return {
      label: `${item} ${t(" Days")}`,
      value: item * 24 * 60 * 60,
    };
  });
  option.push({ label: t(" Custom"), value: "custom" });
  return option;
}

// value : Second
export function addDateByValue(date: Date, value: number) {
  let newNum = date.setTime(date.getTime() + value * 1000);
  return new Date(newNum);
}

export function isExitInList(targetKey: string, targetValue: any, list: any[] | undefined) {
  const indexList: number[] = [];
  (list || []).forEach((item: any, index: number) => {
    if (item[targetKey] === targetValue) {
      indexList.push(index);
    }
  });
  return indexList;
}
