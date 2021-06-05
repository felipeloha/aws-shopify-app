import { Button, Card, Filters } from "@shopify/polaris";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { messagesEn } from "../../constants/messages.en";

function SearchBar({ notifySearchValue }) {
  const [queryValue, setQueryValue] = useState(null);

  function handleSearch() {
    notifySearchValue(queryValue);
  }

  function handleRemove() {
    notifySearchValue(null);
    setQueryValue(null);
  }

  return (
    <Card.Section>
      <Filters
        queryValue={queryValue}
        onQueryChange={(value) => setQueryValue(value)}
        onQueryClear={handleRemove}
        filters={[]}
        queryPlaceholder={messagesEn.salesOrders.searchBar.queryPlaceholder}
        appliedFilters={[]}
      >
        <Button onClick={handleSearch}>
          {messagesEn.salesOrders.searchBar.button}
        </Button>
      </Filters>
    </Card.Section>
  );
}

SearchBar.propTypes = {
  notifySearchValue: PropTypes.func.isRequired,
};
export default SearchBar;
