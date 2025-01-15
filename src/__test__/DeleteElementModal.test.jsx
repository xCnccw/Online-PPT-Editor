import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteElementModal from "../components/DeleteElementModal";
import { vi } from "vitest";

describe("DeleteElementModal Component", () => {
  const onCloseMock = vi.fn();
  const onDeleteMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(
      <DeleteElementModal isOpen={true} onClose={onCloseMock} onDelete={onDeleteMock} />
    );

    // Check if modal content is displayed
    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this element?")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <DeleteElementModal isOpen={false} onClose={onCloseMock} onDelete={onDeleteMock} />
    );

    // Check that modal content is not displayed
    expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
  });

  it("calls onClose when the Cancel button is clicked", () => {
    render(
      <DeleteElementModal isOpen={true} onClose={onCloseMock} onDelete={onDeleteMock} />
    );

    // Click the Cancel button
    fireEvent.click(screen.getByText("Cancel"));

    // Verify that onClose is called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when the Delete button is clicked", () => {
    render(
      <DeleteElementModal isOpen={true} onClose={onCloseMock} onDelete={onDeleteMock} />
    );

    // Click the Delete button
    fireEvent.click(screen.getByText("Delete"));

    // Verify that onDelete is called
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });
});
