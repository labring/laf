import { PageValues } from "@/components/Pagination";

export default function getPageInfo(data: {
  pageSize: number;
  page: number;
  total: number;
  [key: string]: any;
}): PageValues {
  return {
    pageSize: data?.pageSize,
    limit: data?.pageSize,
    page: data?.page,
    total: data?.total,
  };
}
