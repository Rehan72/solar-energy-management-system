import React, { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SearchBar Component
 * A reusable search input with solar-themed styling
 *
 * @param {string} value - Current search value
 * @param {function} onChange - Callback when search value changes
 * @param {string} placeholder - Placeholder text
 * @param {number} debounce - Debounce delay in ms (default: 300)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showClear - Show clear button (default: true)
 * @param {string} searchKey - Optional key for onChange payload
 */
const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
  debounce = 300,
  className,
  showClear = true,
  searchKey = "search",
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Handle input change with debounce
  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (onChange) {
        if (debounce > 0) {
          // Debounced callback
          const timeoutId = setTimeout(() => {
            onChange({ key: searchKey, value: newValue });
          }, debounce);
          return () => clearTimeout(timeoutId);
        } else {
          // Immediate callback
          onChange({ key: searchKey, value: newValue });
        }
      }
    },
    [onChange, debounce, searchKey]
  );

  // Clear search
  const handleClear = () => {
    setLocalValue("");
    if (onChange) {
      onChange({ key: searchKey, value: "" });
    }
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <Search className="h-4 w-4 text-solar-muted" />
      </div>

      {/* Input Field */}
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10 h-10 rounded-xl border-solar-border/50 bg-solar-card/50 dark:bg-solar-card/50 backdrop-blur-sm focus:border-solar-orange focus:ring-solar-orange/20"
      />

      {/* Clear Button */}
      {showClear && localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-solar-yellow/20 text-solar-muted hover:text-solar-orange transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
