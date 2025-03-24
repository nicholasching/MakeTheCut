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

const courses = [
  { value: "abld 3ba3", label: "ABLD 3BA3" },
  { value: "abld 3cd3", label: "ABLD 3CD3" },
  { value: "anthrop 1aa3", label: "ANTHROP 1AA3" },
  { value: "anthrop 1ab3", label: "ANTHROP 1AB3" },
  { value: "art 1ti3", label: "ART 1TI3" },
  { value: "art 1ui3", label: "ART 1UI3" },
  { value: "astron 1f03", label: "ASTRON 1F03" },
  { value: "biology 1a03", label: "BIOLOGY 1A03" },
  { value: "biology 1m03", label: "BIOLOGY 1M03" },
  { value: "biology 1p03", label: "BIOLOGY 1P03" },
  { value: "biophys 1s03", label: "BIOPHYS 1S03" },
  { value: "cayuga 1z03", label: "CAYUGA 1Z03" },
  { value: "chem 1a03", label: "CHEM 1A03" },
  { value: "chem 1aa3", label: "CHEM 1AA3" },
  { value: "chem 1r03", label: "CHEM 1R03" },
  { value: "chinese 1z06", label: "CHINESE 1Z06" },
  { value: "cmst 1a03", label: "CMST 1A03" },
  { value: "commerce 1aa3", label: "COMMERCE 1AA3" },
  { value: "commerce 1b03", label: "COMMERCE 1B03" },
  { value: "commerce 1ba3", label: "COMMERCE 1BA3" },
  { value: "commerce 1da3", label: "COMMERCE 1DA3" },
  { value: "commerce 1ma3", label: "COMMERCE 1MA3" },
  { value: "commerce 4ak3", label: "COMMERCE 4AK3" },
  { value: "commerce 4fp3", label: "COMMERCE 4FP3" },
  { value: "compsci 1jc3", label: "COMPSCI 1JC3" },
  { value: "compsci 1md3", label: "COMPSCI 1MD3" },
  { value: "earthsc 1g03", label: "EARTHSC 1G03" },
  { value: "econ 1b03", label: "ECON 1B03" },
  { value: "econ 1bb3", label: "ECON 1BB3" },
  { value: "english 1cs3", label: "ENGLISH 1CS3" },
  { value: "english 1f03", label: "ENGLISH 1F03" },
  { value: "english 1g03", label: "ENGLISH 1G03" },
  { value: "english 1h03", label: "ENGLISH 1H03" },
  { value: "envirsc 1c03", label: "ENVIRSC 1C03" },
  { value: "envsoc 1ha3", label: "ENVSOCTY 1HA3" },
  { value: "envsoc 1hb3", label: "ENVSOCTY 1HB3" },
  { value: "farsi 1z03", label: "FARSI 1Z03" },
  { value: "farsi 1zz3", label: "FARSI 1ZZ3" },
  { value: "french 1a06", label: "FRENCH 1A06" },
  { value: "french 1z06", label: "FRENCH 1Z06" },
  { value: "gendrst 1a03", label: "GENDRST 1A03" },
  { value: "gendrst 1aa3", label: "GENDRST 1AA3" },
  { value: "german 1b03", label: "GERMAN 1B03" },
  { value: "german 1bb3", label: "GERMAN 1BB3" },
  { value: "german 1z06", label: "GERMAN 1Z06" },
  { value: "gkromst 1a03", label: "GKROMST 1A03" },
  { value: "gkromst 1b03", label: "GKROMST 1B03" },
  { value: "gkromst 1m03", label: "GKROMST 1M03" },
  { value: "globalzn 1a03", label: "GLOBALZN 1A03" },
  { value: "greek 1z03", label: "GREEK 1Z03" },
  { value: "greek 1zz3", label: "GREEK 1ZZ3" },
  { value: "hlthage 1aa3", label: "HLTHAGE 1AA3" },
  { value: "hlthage 1bb3", label: "HLTHAGE 1BB3" },
  { value: "hlthage 1cc3", label: "HLTHAGE 1CC3" },
  { value: "hthsci 1dt3", label: "HTHSCI 1DT3" },
  { value: "hthsci 1m03", label: "HTHSCI 1M03" },
  { value: "history 1cc3", label: "HISTORY 1CC3" },
  { value: "history 1dd3", label: "HISTORY 1DD3" },
  { value: "history 1ee3", label: "HISTORY 1EE3" },
  { value: "history 1m03", label: "HISTORY 1M03" },
  { value: "history 1p03", label: "HISTORY 1P03" },
  { value: "history 1q03", label: "HISTORY 1Q03" },
  { value: "iarts 1bd3", label: "IARTS 1BD3" },
  { value: "iarts 1cr3", label: "IARTS 1CR3" },
  { value: "iarts 1ha3", label: "IARTS 1HA3" },
  { value: "iarts 1pa3", label: "IARTS 1PA3" },
  { value: "iarts 1pb3", label: "IARTS 1PB3" },
  { value: "iarts 1ss3", label: "IARTS 1SS3" },
  { value: "iarts 1t03", label: "IARTS 1T03" },
  { value: "indigst 1a03", label: "INDIGST 1A03" },
  { value: "indigst 1b03", label: "INDIGST 1B03" },
  { value: "indigst 1aa3", label: "INDIGST 1AA3" },
  { value: "innovate 2si3", label: "INNOVATE 2SI3" },
  { value: "italian 1a03", label: "ITALIAN 1A03" },
  { value: "italian 1aa3", label: "ITALIAN 1AA3" },
  { value: "italian 1z06", label: "ITALIAN 1Z06" },
  { value: "inspire 1a03", label: "INSPIRE 1A03" },
  { value: "inspire 1pl3", label: "INSPIRE 1PL3" },
  { value: "inspire 3el3", label: "INSPIRE 3EL3" },
  { value: "inspire 3ii3", label: "INSPIRE 3II3" },
  { value: "inspire 3mp3", label: "INSPIRE 3MP3" },
  { value: "japanese 1z06", label: "JAPANESE 1Z06" },
  { value: "korean 1z03", label: "KOREAN 1Z03" },
  { value: "korean 1zz3", label: "KOREAN 1ZZ3" },
  { value: "latam 2a03", label: "LATAM 2A03" },
  { value: "latam 3a03", label: "LATAM 3A03" },
  { value: "latin 1z03", label: "LATIN 1Z03" },
  { value: "latin 1zz3", label: "LATIN 1ZZ3" },
  { value: "lifesci 1d03", label: "LIFESCI 1D03" },
  { value: "linguist 1a03", label: "LINGUIST 1A03" },
  { value: "linguist 1aa3", label: "LINGUIST 1AA3" },
  { value: "linguist 1z03", label: "LINGUIST 1Z03" },
  { value: "linguist 1zz3", label: "LINGUIST 1ZZ3" },
  { value: "math 1a03", label: "MATH 1A03" },
  { value: "math 1aa3", label: "MATH 1AA3" },
  { value: "math 1b03", label: "MATH 1B03" },
  { value: "math 1c03", label: "MATH 1C03" },
  { value: "math 1f03", label: "MATH 1F03" },


  { value: "math 1k03", label: "MATH 1K03" },
  { value: "math 1ls3", label: "MATH 1LS3" },
  { value: "math 1lt3", label: "MATH 1LT3" },
  { value: "math 1mm3", label: "MATH 1MM3" },
  { value: "math 1mp3", label: "MATH 1MP3" },
  { value: "mediaart 1a03", label: "MEDIAART 1A03" },
  { value: "mohawk 1z03", label: "MOHAWK 1Z03" },
  { value: "music 1a03", label: "MUSIC 1A03" },
  { value: "music 1aa3", label: "MUSIC 1AA3" },
  { value: "music 1cr3", label: "MUSIC 1CR3" },
  { value: "ojibwe 1z03", label: "OJIBWE 1Z03" },
  { value: "peacjust 1a03", label: "PEACJUST 1A03" },
  { value: "philos 1a03", label: "PHILOS 1A03" },
  { value: "philos 1b03", label: "PHILOS 1B03" },
  { value: "philos 1e03", label: "PHILOS 1E03" },
  { value: "philos 1f03", label: "PHILOS 1F03" },
  { value: "physics 1a03", label: "PHYSICS 1A03" },
  { value: "physics 1aa3", label: "PHYSICS 1AA3" },
  { value: "physics 1c03", label: "PHYSICS 1C03" },
  { value: "physics 1cc3", label: "PHYSICS 1CC3" },
  { value: "polsci 1aa3", label: "POLSCI 1AA3" },
  { value: "polsci 1ab3", label: "POLSCI 1AB3" },
  { value: "psych 1f03", label: "PSYCH 1F03" },
  { value: "psych 1ff3", label: "PSYCH 1FF3" },
  { value: "psych 1x03", label: "PSYCH 1X03" },
  { value: "psych 1xx3", label: "PSYCH 1XX3" },
  { value: "russian 1z03", label: "RUSSIAN 1Z03" },
  { value: "russian 1zz3", label: "RUSSIAN 1ZZ3" },
  { value: "scar 1b03", label: "SCAR 1B03" },
  { value: "scar 1sc3", label: "SCAR 1SC3" },
  { value: "science 1a03", label: "SCIENCE 1A03" },
  { value: "socpsy 1z03", label: "SOCPSY 1Z03" },
  { value: "socsci 1ss3", label: "SOCSCI 1SS3" },
  { value: "socsci 1t03", label: "SOCSCI 1T03" },
  { value: "sociol 1c03", label: "SOCIOL 1C03" },
  { value: "sociol 1z03", label: "SOCIOL 1Z03" },
  { value: "socwork 1aa3", label: "SOCWORK 1AA3" },
  { value: "socwork 1bb3", label: "SOCWORK 1BB3" },
  { value: "spanish 1a03", label: "SPANISH 1A03" },
  { value: "spanish 1aa3", label: "SPANISH 1AA3" },
  { value: "spanish 1z06", label: "SPANISH 1Z06" },
  { value: "stats 1ll3", label: "STATS 1LL3" },
  { value: "sustain 1s03", label: "SUSTAIN 1S03" },
  { value: "sustain 2is3", label: "SUSTAIN 2IS3" },
  { value: "sustain 2s03", label: "SUSTAIN 2S03" },
  { value: "sustain 2sd3", label: "SUSTAIN 2SD3" },
  { value: "sustain 2ss3", label: "SUSTAIN 2SS3" },
  { value: "worklabr 1a03", label: "WORKLABR 1A03" },
  { value: "worklabr 1e03", label: "WORKLABR 1E03" },
]

interface ComboboxProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Combobox({
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
            ? courses.find((course) => course.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>No course found.</CommandEmpty>
            <CommandGroup>
              {courses.map((course) => (
                <CommandItem
                  key={course.value}
                  value={course.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === course.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {course.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
