export default function getPageInfo(data: {
  limit: number;
  page: number;
  total: number;
  [key: string]: any;
}): {
  limit: number;
  page: number;
  total?: number;
} {
  if (!data)
    return {
      limit: 10,
      page: 1,
    };
  return {
    limit: data.limit,
    page: data.page,
    total: data.total,
  };
}
