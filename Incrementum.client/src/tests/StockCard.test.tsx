// StockCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import StockCard from "../StockCard";
import { useNavigate } from "react-router-dom";


// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("StockCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the symbol and name correctly", () => {
    render(<StockCard symbol="AAPL" name="Apple Inc." />);
    
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
  });

  it("navigates to the correct route when clicked", () => {
    render(<StockCard symbol="AAPL" name="Apple Inc." />);
    
    const card = screen.getByText("AAPL").closest("div");
    expect(card).toBeInTheDocument();

    if (card) fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/stock/AAPL");
  });
});
