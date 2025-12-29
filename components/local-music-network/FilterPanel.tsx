import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LocationAutocomplete } from "@/components/local-music-network/LocationAutocomplete";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSection {
  id: string;
  title: string;
  type: "checkbox" | "select" | "range" | "location";
  options: FilterOption[];
}

interface FilterPanelProps {
  sections: FilterSection[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (sectionId: string, value: string, checked: boolean) => void;
  onSelectChange: (sectionId: string, value: string) => void;
  onRangeChange?: (sectionId: string, min: string, max: string) => void;
  onClearAll: () => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

function FilterContent({
  sections,
  selectedFilters,
  onFilterChange,
  onSelectChange,
  onRangeChange,
  onClearAll,
}: Omit<FilterPanelProps, "mobileOpen" | "onMobileOpenChange">) {
  const hasActiveFilters = Object.values(selectedFilters).some(
    (filters) => filters.length > 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {sections.map((section, idx) => (
        <div key={section.id}>
          {idx > 0 && <Separator className="mb-6" />}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {section.title}
            </h4>

            {section.type === "location" ? (
              <LocationAutocomplete
                value={selectedFilters[section.id]?.[0] || ""}
                onChange={(value) => onSelectChange(section.id, value || "all")}
                placeholder="Search locations..."
                data-testid={`input-filter-${section.id}`}
              />
            ) : section.type === "select" ? (
              <Select
                value={selectedFilters[section.id]?.[0] || "all"}
                onValueChange={(value) => onSelectChange(section.id, value)}
              >
                <SelectTrigger data-testid={`select-${section.id}`}>
                  <SelectValue placeholder={`Select ${section.title.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {section.title}</SelectItem>
                  {section.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : section.type === "range" ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={selectedFilters[section.id]?.[0] || ""}
                    onChange={(e) =>
                      onRangeChange?.(
                        section.id,
                        e.target.value,
                        selectedFilters[section.id]?.[1] || ""
                      )
                    }
                    data-testid={`input-${section.id}-min`}
                    className="w-full"
                  />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max"
                    value={selectedFilters[section.id]?.[1] || ""}
                    onChange={(e) =>
                      onRangeChange?.(
                        section.id,
                        selectedFilters[section.id]?.[0] || "",
                        e.target.value
                      )
                    }
                    data-testid={`input-${section.id}-max`}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {section.options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${section.id}-${option.value}`}
                        checked={selectedFilters[section.id]?.includes(option.value)}
                        onCheckedChange={(checked) =>
                          onFilterChange(section.id, option.value, !!checked)
                        }
                        data-testid={`checkbox-${section.id}-${option.value}`}
                      />
                      <Label
                        htmlFor={`${section.id}-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FilterPanel(props: FilterPanelProps) {
  const { mobileOpen, onMobileOpenChange, ...filterProps } = props;

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 p-4 rounded-lg border bg-card">
          <FilterContent {...filterProps} />
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent {...filterProps} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// CodeRabbit Audit Trigger
