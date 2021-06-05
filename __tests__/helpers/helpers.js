import { waitFor } from "@testing-library/react";
import { ORDERS_OFFSET } from "../../constants/ordersConstants";

const GRAPHQL_REQUESTS_TO_IGNORE = [
  "POST https://test-shop:443/admin/api/2019-10/graphql.json",
];

export const assertNocksDone = function (nocks, _expect) {
  if (!nocks.isDone()) {
    // Graphql nocks are being verified in a different way, they stay as pending nocks for nock.
    const pendingAxiosNocks = nocks
      .activeMocks()
      .filter((nock) => !GRAPHQL_REQUESTS_TO_IGNORE.includes(nock));

    if (pendingAxiosNocks.length > 0) {
      const testName = _expect.getState().currentTestName;

      const message = `${testName} \nactive nocks: ${pendingAxiosNocks.join(
        ", "
      )} \npending nocks: ${nocks.pendingMocks().join(", ")}`;
      _expect(message).toBe("");
    }
  }
};

export const waitForMocksDone = async function (mocks) {
  return waitFor(
    () => {
      mocks.forEach((mock) => expect(mock.isDone()).toBeTruthy());
    },
    {
      timeout: global.DEFAULT_TIMEOUT_5,
      onTimeout: (error) => {
        const openNocks = mocks
          .filter((mock) => !mock.isDone())
          .map((mock) => Object.keys(mock.keyedInterceptors));
        const message =
          "The following mocks were not executed: \n" +
          `${openNocks.join("\n")}`;
        expect(message).toBe("");
      },
    }
  );
};

export function defineWindowMatchMedia() {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
}

const defaultGraphqlExtensions = {
  cost: {
    requestedQueryCost: 12,
    actualQueryCost: 12,
    throttleStatus: {
      maximumAvailable: 1000,
      currentlyAvailable: 988,
      restoreRate: 50,
    },
  },
};

export const shopifyOrderMock = {
  name: "#2103",
  id: "3833961775258",
  fulfillmentStatus: "UNFULFILLED",
  financialStatus: "PAID",
};

export const graphqlListOrdersResponse = {
  name: "getOrders",
  variables: {
    offset: ORDERS_OFFSET,
  },
  data: {
    orders: {
      edges: [
        {
          cursor:
            "eyJsYXN0X2lkIjozODMzOTYxNzc1MjU4LCJsYXN0X3ZhbHVlIjoiMjAyMS0wNS0yOCAyMzoyMjoxOC4yNTE1NjQifQ==",
          node: {
            id: `gid://shopify/Order/${shopifyOrderMock.id}`,
            name: shopifyOrderMock.name,
            displayFulfillmentStatus: shopifyOrderMock.fulfillmentStatus,
            displayFinancialStatus: shopifyOrderMock.financialStatus,
            __typename: "Order",
          },
          __typename: "OrderEdge",
        },
      ],
      __typename: "OrderConnection",
    },
  },
  extensions: defaultGraphqlExtensions,
};

export const graphqlListOrdersResponseNoResults = {
  name: "getOrderByName",
  variables: {
    query: "name:#2104",
  },
  data: {
    orders: {
      edges: [],
      __typename: "OrderConnection",
    },
  },
  extensions: defaultGraphqlExtensions,
};

export const graphqlSearchOrdersResponse = {
  name: "getOrderByName",
  variables: {
    query: "name:#2104",
  },
  data: {
    orders: {
      edges: [
        {
          cursor:
            "eyJsYXN0X2lkIjozODMzOTYxNzc1MjU4LCJsYXN0X3ZhbHVlIjoiMjAyMS0wNS0yOCAyMzoyMjoxOC4yNTE1NjQifQ==",
          node: {
            id: `gid://shopify/Order/${shopifyOrderMock.id}`,
            name: "#2104",
            displayFulfillmentStatus: shopifyOrderMock.fulfillmentStatus,
            displayFinancialStatus: shopifyOrderMock.financialStatus,
            __typename: "Order",
          },
          __typename: "OrderEdge",
        },
      ],
      __typename: "OrderConnection",
    },
  },
  extensions: defaultGraphqlExtensions,
};

export const graphqlOrdersResponseWithErrors = {
  name: "getOrders",
  variables: {
    offset: ORDERS_OFFSET,
  },
  data: { orders: { edges: [], __typename: "OrderConnection" } },
  extensions: defaultGraphqlExtensions,
  status: 401,
  graphQLErrors: [],
  error: "Some error message",
};
