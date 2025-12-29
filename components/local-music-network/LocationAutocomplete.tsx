// Simplified LocationAutocomplete focusing on suburbs only
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import {
  searchLocations,
  formatLocation,
  type VictoriaLocation,
} from "@/lib/victoriaLocations";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: VictoriaLocation) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search for your suburb...",
  className,
  "data-testid": testId,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<VictoriaLocation[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.trim().length > 0) {
      const results = searchLocations(newValue, 8);
      setSuggestions(results);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length > 0) {
      const results = searchLocations(inputValue, 8);
      setSuggestions(results);
      setIsOpen(true);
    }
  };

  const selectLocation = (location: VictoriaLocation) => {
    // We only want the suburb name for storage, maybe suburb + postcode? 
    // The previous logic used 'suburb' only for storage if not region.
    // User requested "Location" -> "Suburb". Storing just suburb is fine if unique enough, 
    // but suburbs can be duplicated. However, implementation used `location.suburb`.
    // I'll stick to `location.suburb` to minimize schema impact, or `formatLocation(location)`?
    // User said "only have options for Victorian suburbs".
    // I'll use formatLocation (Suburb, Region Postcode) for display, and Suburb for value?
    // Actually, storing "Suburb, VIC Postcode" is better for geocoding.
    // But existing data might be just suburb.
    // I'll stick to Previous logic: `onChange(location.suburb)`.
    // Wait, previous logic was: `const storageValue = showRegionOnly ? location.region : location.suburb;`
    // So it stored just the suburb name.

    const displayValue = formatLocation(location);
    const storageValue = location.suburb;
    setInputValue(displayValue);
    onChange(storageValue);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter") {
      if (suggestions.length > 0) {
        e.preventDefault();
        selectLocation(suggestions[0]);
      }
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-8"
          data-testid={testId}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid={testId ? `${testId}-clear` : undefined}
          >
            <span className="sr-only">Clear</span>
            <span aria-hidden="true" className="text-lg leading-none">&times;</span>
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          data-testid={testId ? `${testId}-dropdown` : undefined}
        >
          <div className="max-h-60 overflow-y-auto p-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Suburbs
            </div>
            {suggestions.map((location) => (
              <button
                key={`${location.suburb}-${location.postcode}`}
                type="button"
                onClick={() => selectLocation(location)}
                className="w-full flex items-start gap-2 px-3 py-2 text-sm text-left hover-elevate active-elevate-2 rounded-sm cursor-pointer"
                data-testid={testId ? `${testId}-suburb-${location.suburb.replace(/\s+/g, "-").toLowerCase()}` : undefined}
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{location.suburb}</div>
                  <div className="text-xs text-muted-foreground">
                    {location.region} {location.postcode}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && suggestions.length === 0 && inputValue.trim().length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md p-3 text-sm text-muted-foreground text-center">
          No suburbs found.
        </div>
      )}
    </div>
  );
}

// CodeRabbit Audit Trigger
