import { APIError } from "encore.dev/api";
import type { PaginatedRequest, PaginationOpts } from "~lib/common/schemas";

const PaginationParams = (keys: string[], opts: PaginatedRequest): PaginationOpts => {
  const page = opts.page || 0;
  const limit = opts.limit || 10;
  const orderBy = opts.orderBy || "id";
  const orderDir = opts.orderDir || "desc";

  if (orderBy && !keys.includes(orderBy)) {
    throw APIError.invalidArgument(`Invalid orderBy: ${orderBy}`);
  }

  if (orderDir && !["asc", "desc"].includes(orderDir)) {
    throw APIError.invalidArgument(`Invalid orderDir: ${orderDir}`);
  }

  return { page, limit, orderBy, orderDir };
};

const Validate = {
  PaginationParams,
};

export default Validate;
