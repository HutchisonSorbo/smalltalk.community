import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import {
  searchLocations,
  formatLocation,
  victoriaRegions,
  type VictoriaLocation,
} from "@/lib/victoriaLocations";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showRegionOnly?: boolean;
  "data-testid"?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search suburbs or regions...",
  className,
  showRegionOnly = false,
  "data-testid": testId,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<VictoriaLocation[]>([]);
  const [showRegions, setShowRegions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRegions(false);
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
      setShowRegions(false);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (showRegionOnly || inputValue.trim() === "") {
      setShowRegions(true);
      setIsOpen(true);
    } else if (inputValue.trim().length > 0) {
      const results = searchLocations(inputValue, 8);
      setSuggestions(results);
      setIsOpen(true);
    }
  };

  const selectLocation = (location: VictoriaLocation) => {
    const displayValue = showRegionOnly ? location.region : formatLocation(location);
    const storageValue = showRegionOnly ? location.region : location.suburb;
    setInputValue(displayValue);
    onChange(storageValue);
    setIsOpen(false);
    setSuggestions([]);
    setShowRegions(false);
  };

  const selectRegion = (region: string) => {
    setInputValue(region);
    onChange(region);
    setIsOpen(false);
    setShowRegions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setShowRegions(false);
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

      {isOpen && (showRegions || suggestions.length > 0) && (
        <div 
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          data-testid={testId ? `${testId}-dropdown` : undefined}
        >
          {showRegions && (
            <div className="max-h-60 overflow-y-auto p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Victoria Regions
              </div>
              {victoriaRegions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => selectRegion(region)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover-elevate active-elevate-2 rounded-sm cursor-pointer"
                  data-testid={testId ? `${testId}-region-${region.replace(/\s+/g, "-").toLowerCase()}` : undefined}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{region}</span>
                </button>
              ))}
            </div>
          )}

          {!showRegions && suggestions.length > 0 && (
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
          )}

          {!showRegions && suggestions.length === 0 && inputValue.trim() && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No suburbs found. Try a different search or select a region.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
