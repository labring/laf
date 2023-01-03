import dayjs from "dayjs";

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

export function formatCapacity(capacity: string) {
  const num = capacity.split("Gi")[0];
  return parseInt(num, 10);
}
