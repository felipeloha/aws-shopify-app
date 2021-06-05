// ID, ORDER_NUM, FULFILLMENT STATUS, FINANCIAL STATUS
export const COLUMN_CONTENT_TYPES = ["text", "text", "text", "text", "string"];

export const COLUMN_HEADINGS = [
  "Order ID",
  "Order Name",
  "Financial Status",
  "Fulfillment Staus",
];

export const ORDER_ID_PREFIX = "gid://shopify/Order/";

export const ORDERS_OFFSET = 10;

export const ORDER_NOT_FOUND_KEY = "order_not_found";

export const ORDERS_STATUSES_COLORS = {
  // Colors for shopify style
  cancelled: "critical",
  queue: "warning",
  packing: "attention",
  picking: "attention",
  ended: "success",
};

export const ORDER_STATUSES_PROGRESS = {
  ended: "complete",
  queue: "incomplete",
  packing: "partiallyComplete",
  picking: "partiallyComplete",
};

export const QUERY_MODE = {
  listOrders: 1,
  searchOrder: 2,
};
