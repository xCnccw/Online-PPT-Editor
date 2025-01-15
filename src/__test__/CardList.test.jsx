// src/__test__/CardList.test.jsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import CardList from "../components/CardList";
import { createTestStore } from "../store/testUtils";
import { setCurrentPresentationId } from "../store/presentationSlice";
import { vi } from "vitest";
import { useNavigate } from "react-router-dom";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("CardList Component", () => {
  let store;
  const mockNavigate = vi.fn();

  beforeEach(() => {
    store = createTestStore();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  const mockPresentations = [
    {
      presentationId: "1",
      title: "Test Presentation 1",
      description: "Description 1",
      thumbnail: "https://example.com/image1.png",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      presentationId: "2",
      title: "Test Presentation 2",
      description: "Description 2",
      thumbnail: "https://example.com/image2.png",
      createdAt: "2024-02-01T00:00:00Z",
    },
  ];

  it("renders CardList correctly with presentations", async () => {
    store = createTestStore({
      presentation: {
        presentations: mockPresentations,
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CardList />
        </MemoryRouter>
      </Provider>
    );

    // Debug the rendered content
    screen.debug();

    // Use waitFor to ensure asynchronous rendering is complete
    await waitFor(() => {
      expect(screen.getByText("Test Presentation 1")).toBeInTheDocument();
      expect(screen.getByText("Description 1")).toBeInTheDocument();
      expect(screen.getByText("Test Presentation 2")).toBeInTheDocument();
      expect(screen.getByText("Description 2")).toBeInTheDocument();
    });
  });

  it("sorts presentations by Newest-first", async () => {
    store = createTestStore({
      presentation: {
        presentations: mockPresentations,
        selectedKey: "Newest-first",
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CardList />
        </MemoryRouter>
      </Provider>
    );

    // Ensure the presentations are sorted by Newest-first
    await waitFor(() => {
      const titles = screen.getAllByText(/Test Presentation/);
      expect(titles[0].textContent).toBe("Test Presentation 2");
      expect(titles[1].textContent).toBe("Test Presentation 1");
    });
  });

  it("navigates to edit page on button click", async () => {
    store = createTestStore({
      presentation: {
        presentations: mockPresentations,
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CardList />
        </MemoryRouter>
      </Provider>
    );

    // Use findAllByText to get all "Enter" buttons
    const enterButtons = await screen.findAllByText("Enter");

    // Click the first "Enter" button
    fireEvent.click(enterButtons[0]);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/edit/1?slide=1");
  });

  it("displays error message when there is an error", async () => {
    const errorMessage = "Failed to load presentations";

    store = createTestStore({
      presentation: {
        presentations: [],
        isLoading: false,
        error: errorMessage,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CardList />
        </MemoryRouter>
      </Provider>
    );

    // Ensure the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});
