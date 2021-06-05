import React from "react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import MainContainer from "./mainContainer";

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <MainContainer />
    </AppProvider>
  );
}

export default App;
