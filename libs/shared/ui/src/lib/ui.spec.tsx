import { render } from "@testing-library/react";

import CsfinPortfolioUi from "./ui";

describe("CsfinPortfolioUi", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<CsfinPortfolioUi />);
    expect(baseElement).toBeTruthy();
  });
});
