import dayjs from "dayjs";

export function formatDate(
  date?: string | number | Date | dayjs.Dayjs | null | undefined,
  format = "YYYY-MM-DD HH:mm",
) {
  return dayjs(date).format(format);
}
