import type { PaginationOpts } from "~lib/common/schemas";

interface PaginationDataArgs<T> {
  data: T[];
  count: number;
  params: PaginationOpts;
}

const PaginationData = <T>({ data, count, params }: PaginationDataArgs<T>) => {
  const totalPages = Math.ceil(count / params.limit);

  return {
    data,
    meta: {
      page: params.page,
      size: params.limit,
      total: count,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
};

const Mapper = {
  PaginationData,
};

export default Mapper;
