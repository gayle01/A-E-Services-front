import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { X, ChevronDown } from "lucide-react";

interface MultiSelectInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function MultiSelectInput({
  value,
  onChange,
  placeholder = "Type and press comma to add multiple items",
  suggestions = [],
  className = "",
}: MultiSelectInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length > 0) {
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const toggleSuggestions = () => {
    if (showSuggestions) {
      setShowSuggestions(false);
    } else {
      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        const newValue = [...items, inputValue.trim()].join(", ");
        onChange(newValue);
        setInputValue("");
        setShowSuggestions(false);
      }
    } else if (e.key === "Backspace" && inputValue === "" && items.length > 0) {
      const newItems = items.slice(0, -1);
      onChange(newItems.join(", "));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newItems = [...items, suggestion];
    onChange(newItems.join(", "));
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems.join(", "));
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="hover:bg-primary/20 rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 0) setShowSuggestions(true);
          }}
          placeholder={items.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 h-7"
        />
        <button
          type="button"
          onClick={toggleSuggestions}
          className="hover:bg-accent rounded p-1 ml-1"
        >
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
