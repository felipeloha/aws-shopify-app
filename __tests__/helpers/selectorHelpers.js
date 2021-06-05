import { screen } from "@testing-library/react";

export function getInputFieldByName(labelText, selector) {
  const inputParentElement = screen.getByText(labelText).parentElement
    .parentElement.nextSibling;
  return inputParentElement.querySelector(selector);
}
