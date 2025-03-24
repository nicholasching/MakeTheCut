"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const streams = [
    { label: "Chemical", value: "chem" },
    { label: "Chemical and Biology", value: "chembio" },
    { label: "Civil", value: "civ" },
    { label: "Computer", value: "comp" },
    { label: "Electrical", value: "elec" },
    { label: "Engineering Physics", value: "engphys" },
    { label: "Materials", value: "mat" },
    { label: "Mechanical", value: "mech" },
    { label: "Mechatronics", value: "tron" },
    { label: "Software", value: "soft" }
  ]

interface ComboboxProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ComboboxStreams ({
  value: externalValue,
  onChange,
  placeholder = "Select Elective",
  className = "w-2/3 mx-auto",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(externalValue || "")

  // Sync internal state with external value if provided
  React.useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    setOpen(false);
    
    // Call the parent's onChange handler with the new value
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={className}
        >
          {value
            ? streams.find((stream) => stream.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>No stream found.</CommandEmpty>
            <CommandGroup>
              {streams.map((stream) => (
                <CommandItem
                  key={stream.value}
                  value={stream.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === stream.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {stream.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
