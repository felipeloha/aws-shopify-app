import React from "react";
import axios from "axios";
import "@testing-library/jest-dom";
import nock from "nock";
import { describe, expect } from "@jest/globals";
import { act, render, screen } from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";

import {
  assertNocksDone,
  defineWindowMatchMedia,
  graphqlListOrdersResponse,
} from "../helpers/helpers";
import httpAdapter from "axios/lib/adapters/http";
import MainContainer from "../../pages/mainContainer";
import { createClient } from "../../server/handlers";
import enTranslations from "@shopify/polaris/locales/en.json";
import { ApolloProvider } from "react-apollo";
import { QueryMock } from "graphql-query-test-mock";

afterEach(() => {
  assertNocksDone(nock, expect);
});

export const queryMock = new QueryMock();

function renderMainContainerView() {
  const client = createClient("test-shop", "shopify-access-token");
  render(
    <AppProvider i18n={enTranslations}>
      <ApolloProvider client={client}>
        <MainContainer />
      </ApolloProvider>
    </AppProvider>
  );
}

describe("Main container page", () => {
  beforeAll(() => {
    // Mock methods -> https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    defineWindowMatchMedia();
  });

  beforeEach(() => {
    axios.defaults.host = MOCK_BACKEND_URL;
    axios.defaults.adapter = httpAdapter;
    queryMock.reset();
    queryMock.setup(MOCK_GRAPHQL_URL);
  });

  it("should show login page when user is not authenticated", async () => {
    await act(async () => {
      renderMainContainerView();
      queryMock.mockQuery(graphqlListOrdersResponse);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const salesOrdersViewTitle = screen.getByText("Sales Orders Results", {
        exact: false,
      });

      expect(salesOrdersViewTitle).toBeInTheDocument();
    });
  });
});
