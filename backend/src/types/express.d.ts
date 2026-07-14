declare namespace Express {
  interface Locals {
    validated?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}

export {};
