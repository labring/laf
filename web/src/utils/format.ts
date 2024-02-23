import dayjs from "dayjs";
import { t } from "i18next";

export function formatDate(
  date?: string | number | Date | dayjs.Dayjs | null | undefined,
  format = "YYYY-MM-DD HH:mm",
) {
  return dayjs(date).format(format);
}

export function formatSize(size: number, fixedNumber = 2) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = 0;
  while (size >= 1024) {
    size /= 1024;
    i++;
  }
  return size.toFixed(fixedNumber) + " " + units[i];
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
      label: `${item} ${t("Days")}`,
      value: item * 24 * 60 * 60,
    };
  });
  option.push({ label: t("Custom"), value: "custom" });
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

export function formatLimitCPU(cpu: number) {
  return cpu / 1000 + t("Unit.CPU");
}

export function formatLimitMemory(memory: number) {
  return memory >= 1024 ? memory / 1024 + t("Unit.GB") : memory + t("Unit.MB");
}

export function formatLimitCapacity(capacity: number) {
  return capacity / 1024 + t("Unit.GB");
}

export function formatLimitTraffic(traffic: number) {
  return traffic / 1024;
}

export function uniformCPU(cpu: number) {
  return cpu;
}

export function uniformMemory(memory: number) {
  return memory / 1024 / 1024;
}

export function uniformCapacity(capacity: number) {
  return capacity / 1024 / 1024;
}

export function uniformStorage(Storage: number) {
  return Storage / 1024 / 1024;
}

export function formatPort(port: number | undefined) {
  return port === 80 || port === 443 ? "" : `:${port}`;
}

export function formatPrice(price?: number) {
  return price ? "¥" + (price / 100).toFixed(2) : "¥0.00";
}

export function formatOriginalPrice(price?: number, fixedNumber?: number) {
  return price ? "¥" + price.toFixed(fixedNumber || 2) : "¥0.00";
}

export function convertMoney(money: number) {
  return money * 100;
}

export function hidePhoneNumber(phone: string) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

export function changeURL(param: string) {
  const currentURL = window.location.pathname;
  const lastIndex = currentURL.lastIndexOf("/");
  return currentURL.substring(0, lastIndex) + param;
}
