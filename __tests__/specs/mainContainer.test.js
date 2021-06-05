import React from "react";
import axios from "axios";
import "@testing-library/jest-dom";
import nock from "nock";
import { describe, expect } from "@jest/globals";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";
import userEvent from "@testing-library/user-event";
import { getInputFieldByName } from "../helpers/selectorHelpers";

import {
  waitForMocksDone,
  assertNocksDone,
  getAuthNock,
  defineWindowMatchMedia,
  graphqlListOrdersResponse,
  shopifyOrderMock,
  getOrdersNock,
  graphqlSearchOrdersResponse,
  graphqlListOrdersResponseNoResults,
} from "../helpers/helpers";
import httpAdapter from "axios/lib/adapters/http";
import { authStorageKeys } from "../../constants/globalConstants";
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

  test("Should show login page when user is not authenticated", async () => {
    renderMainContainerView();
    await act(async () => {
      const loginForm = await screen.findByRole("form");
      expect(loginForm).toBeInTheDocument();
      expect(loginForm).toHaveProperty("name", "e2e-login-form");

      const submitButton = await screen.findByRole("button");
      const usernameInput = getInputFieldByName(
        "Username",
        'input[name="e2e-username-login-input"]'
      );

      userEvent.type(usernameInput, "user_1");

      const passwordInput = getInputFieldByName(
        "Password",
        'input[name="e2e-password-login-input"]'
      );

      userEvent.type(passwordInput, "user_1_password");

      const instanceInput = getInputFieldByName(
        "Instance",
        'input[name="e2e-instance-login-input"]'
      );

      // Default instance value
      userEvent.clear(instanceInput);
      userEvent.type(instanceInput, MOCK_BACKEND_URL);

      expect(submitButton).toBeEnabled();

      userEvent.clear(passwordInput);
      expect(submitButton).not.toBeEnabled();

      userEvent.type(passwordInput, "user_1_password");
      expect(submitButton).toBeEnabled();

      const authNock = getAuthNock(200, { access_token: "ABCD123" });
      queryMock.mockQuery(graphqlListOrdersResponse);

      userEvent.click(submitButton);
      await waitForMocksDone([authNock]);

      // // Check token is saved in storage
      const accessTokenSaved = localStorage.getItem(
        authStorageKeys.accessToken
      );
      expect(accessTokenSaved).toBe("ABCD123");

      const ordersNock = getOrdersNock();
      await new Promise((resolve) => setTimeout(resolve, 100));

      await waitForMocksDone([ordersNock]);
      const salesOrdersViewTitle = screen.getByText("Sales Orders Results", {
        exact: false,
      });

      expect(salesOrdersViewTitle).toBeInTheDocument();
    });
  });
});
