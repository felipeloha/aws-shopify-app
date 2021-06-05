import React, { useState } from "react";
import { Query } from "react-apollo";
import {
  Card,
  Spinner,
  Stack,
  DataTable,
  TextContainer,
  Banner,
  Tooltip,
  Badge,
} from "@shopify/polaris";
import {
  GET_LAST_ORDERS,
  GET_ORDER_BY_NAME,
} from "../../server/handlers/queries/queries";
import {
  COLUMN_CONTENT_TYPES,
  COLUMN_HEADINGS,
  ORDER_ID_PREFIX,
  ORDER_NOT_FOUND_KEY,
  ORDERS_STATUSES_COLORS,
  ORDER_STATUSES_PROGRESS,
  QUERY_MODE,
} from "../../constants/ordersConstants";
import PropTypes from "prop-types";
import { messagesEn } from "../../constants/messages.en";

function OrdersResourceList({ mode, variables }) {
  const [salesOrdersData, setSalesOrdersData] = useState([]);
  const [ordersFetched, setOrdersFetched] = useState(false);

  function extractOrderId(orderId) {
    if (orderId.includes(ORDER_ID_PREFIX))
      return orderId.split(ORDER_ID_PREFIX)[1];

    return orderId;
  }

  function showOrders() {
    if (!salesOrdersData.length) {
      return (
        <Card.Section>
          <TextContainer>
            <Banner>
              <p>{messagesEn.salesOrders.orderNotFoundLabel}</p>
            </Banner>
          </TextContainer>
        </Card.Section>
      );
    }
    const initialRowsData = salesOrdersData.map((order) => [
      extractOrderId(order.node.id),
      order.node.name,
      <Badge>{order.node.displayFinancialStatus.toLowerCase()}</Badge>,
      <Badge>{order.node.displayFulfillmentStatus.toLowerCase()}</Badge>,
    ]);

    return (
      <Card.Section title={messagesEn.salesOrders.resultsSectionTitle}>
        <DataTable
          columnContentTypes={COLUMN_CONTENT_TYPES}
          headings={COLUMN_HEADINGS}
          rows={initialRowsData}
        />
      </Card.Section>
    );
  }

  async function handleOnFinishQuery(data) {
    setOrdersFetched(true);
    setSalesOrdersData(data?.orders?.edges);
    return data?.orders?.edges;
  }

  function getErrorComponent(errorMessage) {
    return (
      <TextContainer>
        <Banner style={{ marginTop: "20px" }} status="critical">
          {errorMessage}
        </Banner>
      </TextContainer>
    );
  }

  function getLoader() {
    return (
      <Stack alignment={"center"} vertical={true}>
        <Spinner size={"large"} hasFocusableParent={true} />
      </Stack>
    );
  }

  return (
    <Query
      query={
        mode === QUERY_MODE.listOrders ? GET_LAST_ORDERS : GET_ORDER_BY_NAME
      }
      variables={variables}
      onCompleted={async (data) => await handleOnFinishQuery(data)}
    >
      {({ loading, error }) => {
        if (loading) return getLoader();

        if (error) return getErrorComponent(error.message);

        if (!ordersFetched) {
          return getLoader();
        }

        return showOrders();
      }}
    </Query>
  );
}

OrdersResourceList.propTypes = {
  mode: PropTypes.number.isRequired,
  variables: PropTypes.object.isRequired,
};

export default OrdersResourceList;
