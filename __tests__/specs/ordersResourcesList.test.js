import "@testing-library/jest-dom";
import React from "react";
import OrdersResourceList from "../../pages/salesOrders/OrdersResourceList";
import { act, render, waitFor } from "@testing-library/react";
import { describe, expect } from "@jest/globals";
import { screen } from "@testing-library/react";
import { ApolloProvider } from "react-apollo";
import { AppProvider } from "@shopify/polaris";
import { createClient } from "../../server/handlers";
import enTranslations from "@shopify/polaris/locales/en.json";
import { QueryMock } from "graphql-query-test-mock";
import httpAdapter from "axios/lib/adapters/http";
import axios from "axios";
import {
  assertNocksDone,
  defineWindowMatchMedia,
  graphqlListOrdersResponse,
  graphqlListOrdersResponseNoResults,
  graphqlOrdersResponseWithErrors,
  graphqlSearchOrdersResponse,
  shopifyOrderMock,
} from "../helpers/helpers";
import { authStorageKeys } from "../../constants/globalConstants";
import nock from "nock";
import { ORDERS_OFFSET, QUERY_MODE } from "../../constants/ordersConstants";

// Mocks graphql requests
export const queryMock = new QueryMock();

function renderResourceListForm(mode, variables) {
  const client = createClient("test-shop", "shopify-access-token");

  render(
    <AppProvider i18n={enTranslations}>
      <ApolloProvider client={client}>
        <OrdersResourceList mode={mode} variables={variables} />
      </ApolloProvider>
    </AppProvider>
  );
}

beforeAll(() => {
  defineWindowMatchMedia();
});

afterEach(() => {
  assertNocksDone(nock, expect);
});

beforeEach(() => {
  axios.defaults.host = MOCK_BACKEND_URL;
  axios.defaults.adapter = httpAdapter;
  localStorage.setItem(authStorageKeys.accessToken, "ABCD123");
  localStorage.setItem(authStorageKeys.host, MOCK_BACKEND_URL);
  queryMock.reset();
  queryMock.setup(MOCK_GRAPHQL_URL);
});

describe("Orders Resource List - List first orders", () => {
  it("should fetch shopify orders and render orders data", async () => {
    await act(async () => {
      queryMock.mockQuery(graphqlListOrdersResponse);
      renderResourceListForm(QUERY_MODE.listOrders, { offset: ORDERS_OFFSET });
      await new Promise((resolve) => setTimeout(resolve, 100));
      const salesOrdersViewTitle = await waitFor(() =>
        screen.getByText("SALES ORDERS", {
          exact: false,
        })
      );

      expect(salesOrdersViewTitle).toBeInTheDocument();

      // order render correctly
      const firstOrderName = screen.getByText(shopifyOrderMock.name, {
        exact: false,
      });
      expect(firstOrderName).toBeInTheDocument();

      const firstOrderId = screen.getByText(shopifyOrderMock.id, {
        exact: false,
      });
      expect(firstOrderId).toBeInTheDocument();

      const firstOrderFulfillmentStatus = screen.getByText(
        shopifyOrderMock.fulfillmentStatus,
        { exact: false }
      );
      expect(firstOrderFulfillmentStatus).toBeInTheDocument();

      const firstOrderFinancialStatus = screen.getByText(
        shopifyOrderMock.fulfillmentStatus,
        { exact: false }
      );
      expect(firstOrderFinancialStatus).toBeInTheDocument();
    });
  });

  it("should fetch shopify orders and render errors if response fails", async () => {
    await act(async () => {
      queryMock.mockQuery(graphqlOrdersResponseWithErrors);

      renderResourceListForm(QUERY_MODE.listOrders, { offset: ORDERS_OFFSET });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const salesOrdersViewTitle = screen.queryByText("SALES ORDERS", {
        exact: false,
      });

      expect(salesOrdersViewTitle).not.toBeInTheDocument();
      const errorMessage = screen.getByText("Network error", { exact: false });
      expect(errorMessage).toBeInTheDocument();
    });
  });
});

describe("Orders Resource List - search order", () => {
  it("search order and render results", async () => {
    await act(async () => {
      queryMock.mockQuery(graphqlSearchOrdersResponse);
      renderResourceListForm(QUERY_MODE.searchOrder, { query: "name:#2104" });
      await new Promise((resolve) => setTimeout(resolve, 100));
      const orderTitle = screen.getByText("#2104");
      expect(orderTitle).toBeInTheDocument();
    });
  });

  it("search order and render error text when no orders is found", async () => {
    await act(async () => {
      queryMock.mockQuery(graphqlListOrdersResponseNoResults);

      renderResourceListForm(QUERY_MODE.searchOrder, { query: "name:#2104" });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const orderNotFoundText = await waitFor(() =>
        screen.getByText("Order not found")
      );
      expect(orderNotFoundText).toBeInTheDocument();
    });
  });
});
