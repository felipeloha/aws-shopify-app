import gql from "graphql-tag";

export const GET_LAST_ORDERS = gql`
  query getOrders($offset: Int) {
    orders(first: $offset, reverse: true) {
      edges {
        cursor
        node {
          id
          name
          displayFulfillmentStatus
          displayFinancialStatus
        }
      }
    }
  }
`;

export const GET_ORDER_BY_NAME = gql`
  query getOrderByName($query: String) {
    orders(first: 25, query: $query) {
      edges {
        cursor
        node {
          id
          name
          displayFulfillmentStatus
          displayFinancialStatus
        }
      }
    }
  }
`;
