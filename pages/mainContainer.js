import React, { useState } from "react";
import { Page, Card } from "@shopify/polaris";
import OrdersResourceList from "./salesOrders/OrdersResourceList";
import { messagesEn } from "../constants/messages.en";
import SearchBar from "./salesOrders/searchBar";
import { ORDERS_OFFSET, QUERY_MODE } from "../constants/ordersConstants";

function MainContainer() {
  const [searchValue, setSearchValue] = useState(null);

  function buildSearchQuery(value) {
    if (value.includes("#")) return `name:${value}`;
    return `name:#${value}`;
  }

  const queryMode = searchValue
    ? QUERY_MODE.searchOrder
    : QUERY_MODE.listOrders;

  const queryVariables = searchValue
    ? { query: buildSearchQuery(searchValue) }
    : { offset: ORDERS_OFFSET };

  const ordersComponent = (
    <OrdersResourceList mode={queryMode} variables={queryVariables} />
  );

  const childComponents = 
    <Card title={messagesEn.salesOrders.viewTitle}>
      {ordersComponent}
    </Card>;

  return <Page fullWidth>{childComponents}</Page>;
}

export default MainContainer;
