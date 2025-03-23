import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '~/components/ui/command';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent
} from '~/components/ui/popover';
import { SearchParams } from '~/routes/dogs';

interface Props {
  selectedZipCodes: string[];
  updateSearchParams: (
    key: keyof SearchParams,
    value: string | string[]
  ) => void;
}

const ZipCodeInput = ({ selectedZipCodes, updateSearchParams }: Props) => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const validateZip = (str: string) => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(str);

  const handleZipCode = (zip: string) => {
    if (zip.length > 5 || !validateZip(zip)) {
      return;
    }

    const zipSet = new Set([...selectedZipCodes, zip]);
    const zipArray = Array.from(zipSet);
    updateSearchParams('zipcodes', zipArray);
    setInput('');
    setOpen(false);
  };

  const handleRemoveZip = (zip: string) => {
    const zipArray = selectedZipCodes.filter((z) => z !== zip);
    updateSearchParams('zipcodes', zipArray);
  };

  return (
    <div className="flex items-center py-4 grow-1">
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              name="zipcode"
              onKeyDown={(e) =>
                setOpen(e.key !== 'Escape' && !!selectedZipCodes.length)
              }
              onMouseDown={() =>
                setOpen((open) => !!selectedZipCodes.length && !open)
              }
              onFocus={() => setOpen(!selectedZipCodes.length)}
              onBlur={() => handleZipCode(input)}
            >
              <Input
                placeholder="Add ZipCode(s)"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    handleZipCode(input);
                    e.preventDefault();
                  }
                }}
                className="truncate italic"
              />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden="true" className="hidden" />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute('cmdk-input')
              ) {
                e.preventDefault();
              }
            }}
            className="w-[--radix-popover-trigger-width] p-0 bg-[#1a1a1a]"
          >
            <CommandList>
              <CommandEmpty>Add multiple ZipCodes</CommandEmpty>
              {!!selectedZipCodes.length && (
                <CommandGroup>
                  {selectedZipCodes.map((i) => (
                    <CommandItem
                      key={i}
                      value={i}
                      onMouseDown={(e) => e.preventDefault()}
                      className="!text-[#facc16] hover:text-[#facc16]"
                      onSelect={handleRemoveZip}
                    >
                      {i}
                      <X />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
};

export default ZipCodeInput;
