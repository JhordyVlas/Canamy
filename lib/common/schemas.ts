import type { Query } from "encore.dev/api";

export interface DefaultResponse {
  message: string;
}

export interface PaginatedRequest {
  page?: Query<number>;
  limit?: Query<number>;
  orderBy?: Query<string>;
  orderDir?: Query<"asc" | "desc">;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    totalPages: number;
    total: number;
    size: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationOpts {
  page: number;
  limit: number;
  orderBy: string;
  orderDir: string;
}
