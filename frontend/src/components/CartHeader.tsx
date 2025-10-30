import { useState, useRef, useEffect } from "react";

export interface CartHeaderProps {
  totalItems: number;
  selectedItems: number;
  allSelected: boolean;
  indeterminate: boolean;
  onSelectAll: (selected: boolean) => void;
  onRemoveSelected: () => void;
  onRemoveAll: () => void;
}

export default function CartHeader({
  totalItems,
  selectedItems,
  allSelected,
  indeterminate,
  onSelectAll,
  onRemoveSelected,
  onRemoveAll,
}: CartHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRemoveSelectedConfirm, setShowRemoveSelectedConfirm] =
    useState(false);
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Update checkbox indeterminate state
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Keyboard navigation for dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isDropdownOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isDropdownOpen]);

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  const handleRemoveDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRemoveSelectedClick = () => {
    setIsDropdownOpen(false);
    setShowRemoveSelectedConfirm(true);
  };

  const handleRemoveAllClick = () => {
    setIsDropdownOpen(false);
    setShowRemoveAllConfirm(true);
  };

  const handleRemoveSelectedConfirm = () => {
    onRemoveSelected();
    setShowRemoveSelectedConfirm(false);
  };

  const handleRemoveAllConfirm = () => {
    onRemoveAll();
    setShowRemoveAllConfirm(false);
  };

  const handleRemoveSelectedCancel = () => {
    setShowRemoveSelectedConfirm(false);
  };

  const handleRemoveAllCancel = () => {
    setShowRemoveAllConfirm(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
        <div className="flex items-center justify-between">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-3">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAllChange}
              aria-label="Select all items"
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 cursor-pointer touch-manipulation"
            />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Select All
              {selectedItems > 0 && (
                <span className="ml-2 text-slate-500 dark:text-slate-400">
                  ({selectedItems} of {totalItems} selected)
                </span>
              )}
            </span>
          </div>

          {/* Remove Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleRemoveDropdownClick}
              aria-label="Remove options"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors touch-manipulation min-h-[44px]"
            >
              Remove
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10"
                role="menu"
                aria-orientation="vertical"
              >
                <button
                  onClick={handleRemoveSelectedClick}
                  disabled={selectedItems === 0}
                  role="menuitem"
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors first:rounded-t-lg touch-manipulation min-h-[44px]"
                >
                  Remove selected items
                  {selectedItems > 0 && (
                    <span className="ml-2 text-slate-500 dark:text-slate-400">
                      ({selectedItems})
                    </span>
                  )}
                </button>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <button
                  onClick={handleRemoveAllClick}
                  role="menuitem"
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors last:rounded-b-lg touch-manipulation min-h-[44px]"
                >
                  Remove all items
                  <span className="ml-2 text-slate-500 dark:text-slate-400">
                    ({totalItems})
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Selected Confirmation Dialog */}
      {showRemoveSelectedConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full"
            role="dialog"
            aria-labelledby="remove-selected-dialog-title"
            aria-describedby="remove-selected-dialog-description"
          >
            <h3
              id="remove-selected-dialog-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
            >
              Remove Selected Items
            </h3>
            <p
              id="remove-selected-dialog-description"
              className="text-sm text-slate-600 dark:text-slate-400 mb-4"
            >
              Are you sure you want to remove {selectedItems}{" "}
              {selectedItems === 1 ? "item" : "items"} from your cart?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleRemoveSelectedCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSelectedConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors touch-manipulation min-h-[44px]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove All Confirmation Dialog */}
      {showRemoveAllConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full"
            role="dialog"
            aria-labelledby="remove-all-dialog-title"
            aria-describedby="remove-all-dialog-description"
          >
            <h3
              id="remove-all-dialog-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
            >
              Remove All Items
            </h3>
            <p
              id="remove-all-dialog-description"
              className="text-sm text-slate-600 dark:text-slate-400 mb-4"
            >
              Are you sure you want to remove all {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"} from your cart?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleRemoveAllCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAllConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors touch-manipulation min-h-[44px]"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
