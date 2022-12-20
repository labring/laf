import { PageValues } from "@/components/Pagination";

export default function getPageInfo(data?: {
  limit: number;
  page: number;
  total: number;
  [key: string]: any;
}): PageValues {
  return {
    limit: data?.limit,
    page: data?.page,
    total: data?.total,
  };
}
