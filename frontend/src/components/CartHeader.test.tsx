import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import CartHeader from "./CartHeader";

describe("CartHeader", () => {
  const mockOnSelectAll = vi.fn();
  const mockOnRemoveSelected = vi.fn();
  const mockOnRemoveAll = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("Select All Checkbox", () => {
    it("renders select all checkbox", () => {
      render(
        <CartHeader
          totalItems={5}
          selectedItems={0}
          allSelected={false}
          indeterminate={false}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /select all items/i,
      });
      expect(checkbox).toBeTruthy();
      expect((checkbox as HTMLInputElement).checked).toBe(false);
    });

    it("shows checkbox as checked when all items selected", () => {
      render(
        <CartHeader
          totalItems={5}
          selectedItems={5}
          allSelected={true}
          indeterminate={false}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /select all items/i,
      });
      expect((checkbox as HTMLInputElement).checked).toBe(true);
    });

    it("shows indeterminate state when some items selected", () => {
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /select all items/i,
      }) as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it("calls onSelectAll when checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={0}
          allSelected={false}
          indeterminate={false}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /select all items/i,
      });
      await user.click(checkbox);

      expect(mockOnSelectAll).toHaveBeenCalledWith(true);
      expect(mockOnSelectAll).toHaveBeenCalledTimes(1);
    });

    it("displays selected item count", () => {
      const { container } = render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      expect(within(container).getByText(/3 of 5 selected/i)).toBeTruthy();
    });

    it("does not display count when no items selected", () => {
      const { container } = render(
        <CartHeader
          totalItems={5}
          selectedItems={0}
          allSelected={false}
          indeterminate={false}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      expect(within(container).queryByText(/of 5 selected/i)).not.toBeTruthy();
    });
  });

  describe("Remove Dropdown", () => {
    it("renders remove button", () => {
      render(
        <CartHeader
          totalItems={5}
          selectedItems={0}
          allSelected={false}
          indeterminate={false}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      expect(removeButton).toBeTruthy();
    });

    it("opens dropdown when remove button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      const removeAllOption = screen.getByRole("menuitem", {
        name: /remove all items/i,
      });

      expect(removeSelectedOption).toBeTruthy();
      expect(removeAllOption).toBeTruthy();
    });

    it("closes dropdown when remove button is clicked again", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);
      await user.click(removeButton);

      const removeSelectedOption = screen.queryByRole("menuitem", {
        name: /remove selected items/i,
      });
      expect(removeSelectedOption).not.toBeTruthy();
    });

    it("closes dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div>
          <CartHeader
            totalItems={5}
            selectedItems={3}
            allSelected={false}
            indeterminate={true}
            onSelectAll={mockOnSelectAll}
            onRemoveSelected={mockOnRemoveSelected}
            onRemoveAll={mockOnRemoveAll}
          />
          <div data-testid="outside">Outside element</div>
        </div>,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const outside = within(container).getByTestId("outside");
      await user.click(outside);

      const removeSelectedOption = screen.queryByRole("menuitem", {
        name: /remove selected items/i,
      });
      expect(removeSelectedOption).not.toBeTruthy();
    });

    it("shows selected item count in dropdown menu", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      expect(removeSelectedOption.textContent).toContain("(3)");
    });

    it("shows total item count in dropdown menu", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeAllOption = screen.getByRole("menuitem", {
        name: /remove all items/i,
      });
      expect(removeAllOption.textContent).toContain("(5)");
    });

    it("disables remove selected option when no items selected", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={0}
          allSelected={false}
          indeterminate={false}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      expect((removeSelectedOption as HTMLButtonElement).disabled).toBe(true);
    });

    it("enables remove selected option when items are selected", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      expect((removeSelectedOption as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe("Remove Selected Confirmation", () => {
    it("shows confirmation dialog when remove selected is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      await user.click(removeSelectedOption);

      const dialog = screen.getByRole("dialog", {
        name: /remove selected items/i,
      });
      expect(dialog).toBeTruthy();
      expect(
        within(dialog).getByText(/are you sure you want to remove 3 items/i),
      ).toBeTruthy();
    });

    it("shows singular form in confirmation for one item", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={1}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      await user.click(removeSelectedOption);

      const dialog = screen.getByRole("dialog", {
        name: /remove selected items/i,
      });
      expect(
        within(dialog).getByText(/are you sure you want to remove 1 item/i),
      ).toBeTruthy();
    });

    it("calls onRemoveSelected when confirmed", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      await user.click(removeSelectedOption);

      const dialog = screen.getByRole("dialog", {
        name: /remove selected items/i,
      });
      const confirmButton = within(dialog).getByRole("button", {
        name: /^remove$/i,
      });
      await user.click(confirmButton);

      expect(mockOnRemoveSelected).toHaveBeenCalledTimes(1);
    });

    it("closes dialog when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      await user.click(removeSelectedOption);

      const dialog = screen.getByRole("dialog", {
        name: /remove selected items/i,
      });
      const cancelButton = within(dialog).getByRole("button", {
        name: /cancel/i,
      });
      await user.click(cancelButton);

      expect(
        screen.queryByRole("dialog", { name: /remove selected items/i }),
      ).not.toBeTruthy();
      expect(mockOnRemoveSelected).not.toHaveBeenCalled();
    });

    it("closes dropdown when remove selected is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      await user.click(removeSelectedOption);

      // Dropdown should be closed
      expect(
        screen.queryByRole("menuitem", { name: /remove selected items/i }),
      ).not.toBeTruthy();
    });
  });

  describe("Remove All Confirmation", () => {
    it("shows confirmation dialog when remove all is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeAllOption = screen.getByRole("menuitem", {
        name: /remove all items/i,
      });
      await user.click(removeAllOption);

      const dialog = screen.getByRole("dialog", { name: /remove all items/i });
      expect(dialog).toBeTruthy();
      expect(
        within(dialog).getByText(
          /are you sure you want to remove all 5 items/i,
        ),
      ).toBeTruthy();
    });

    it("shows singular form in confirmation for one item", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={1}
          selectedItems={0}
          allSelected={false}
          indeterminate={false}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeAllOption = screen.getByRole("menuitem", {
        name: /remove all items/i,
      });
      await user.click(removeAllOption);

      const dialog = screen.getByRole("dialog", { name: /remove all items/i });
      expect(
        within(dialog).getByText(/are you sure you want to remove all 1 item/i),
      ).toBeTruthy();
    });

    it("calls onRemoveAll when confirmed", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeAllOption = screen.getByRole("menuitem", {
        name: /remove all items/i,
      });
      await user.click(removeAllOption);

      const dialog = screen.getByRole("dialog", { name: /remove all items/i });
      const confirmButton = within(dialog).getByRole("button", {
        name: /^remove all$/i,
      });
      await user.click(confirmButton);

      expect(mockOnRemoveAll).toHaveBeenCalledTimes(1);
    });

    it("closes dialog when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeAllOption = screen.getByRole("menuitem", {
        name: /remove all items/i,
      });
      await user.click(removeAllOption);

      const dialog = screen.getByRole("dialog", { name: /remove all items/i });
      const cancelButton = within(dialog).getByRole("button", {
        name: /cancel/i,
      });
      await user.click(cancelButton);

      expect(
        screen.queryByRole("dialog", { name: /remove all items/i }),
      ).not.toBeTruthy();
      expect(mockOnRemoveAll).not.toHaveBeenCalled();
    });

    it("closes dropdown when remove all is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeAllOption = screen.getByRole("menuitem", {
        name: /remove all items/i,
      });
      await user.click(removeAllOption);

      // Dropdown should be closed (menu items should not be in the document)
      expect(
        screen.queryByRole("menuitem", { name: /remove all items/i }),
      ).not.toBeTruthy();
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes dropdown when Escape key is pressed", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      // Dropdown should be open
      expect(
        screen.getByRole("menuitem", { name: /remove selected items/i }),
      ).toBeTruthy();

      // Press Escape
      await user.keyboard("{Escape}");

      // Dropdown should be closed
      expect(
        screen.queryByRole("menuitem", { name: /remove selected items/i }),
      ).not.toBeTruthy();
    });

    it("does not respond to Escape when dropdown is closed", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      // Press Escape without opening dropdown
      await user.keyboard("{Escape}");

      // Should not cause any errors or state changes
      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      expect(removeButton).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes on dropdown button", () => {
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      expect(removeButton.getAttribute("aria-haspopup")).toBe("true");
      expect(removeButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("updates aria-expanded when dropdown is opened", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      expect(removeButton.getAttribute("aria-expanded")).toBe("true");
    });

    it("has proper role attributes on dropdown menu", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const menu = screen.getByRole("menu");
      expect(menu).toBeTruthy();
      expect(menu.getAttribute("aria-orientation")).toBe("vertical");
    });

    it("has proper dialog attributes for confirmation dialogs", async () => {
      const user = userEvent.setup();
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      await user.click(removeButton);

      const removeSelectedOption = screen.getByRole("menuitem", {
        name: /remove selected items/i,
      });
      await user.click(removeSelectedOption);

      const dialog = screen.getByRole("dialog", {
        name: /remove selected items/i,
      });
      expect(dialog.getAttribute("aria-labelledby")).toBe(
        "remove-selected-dialog-title",
      );
      expect(dialog.getAttribute("aria-describedby")).toBe(
        "remove-selected-dialog-description",
      );
    });
  });

  describe("Touch-friendly", () => {
    it("has minimum touch target size on buttons", () => {
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });
      expect(removeButton.className).toContain("min-h-[44px]");
    });

    it("has touch-manipulation class on interactive elements", () => {
      render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /select all items/i,
      });
      const removeButton = screen.getByRole("button", {
        name: /remove options/i,
      });

      expect(checkbox.className).toContain("touch-manipulation");
      expect(removeButton.className).toContain("touch-manipulation");
    });
  });

  describe("Dark Mode", () => {
    it("has dark mode classes", () => {
      const { container } = render(
        <CartHeader
          totalItems={5}
          selectedItems={3}
          allSelected={false}
          indeterminate={true}
          onSelectAll={mockOnSelectAll}
          onRemoveSelected={mockOnRemoveSelected}
          onRemoveAll={mockOnRemoveAll}
        />,
      );

      // Check that dark mode classes are present
      const mainDiv = container.querySelector(".dark\\:bg-slate-800");
      expect(mainDiv).toBeTruthy();
    });
  });
});
