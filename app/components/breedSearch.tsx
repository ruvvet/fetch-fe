import { Command as CommandPrimitive } from 'cmdk';
import debounce from 'debounce';
import fuzzysort from 'fuzzysort';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Command,
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
import { cn } from '~/lib/utils';
import { SearchParams } from '~/routes/dogs';

interface Props {
  breeds: string[];
  selectedBreeds: string[];
  updateSearchParams: (
    key: keyof SearchParams,
    value: string | string[]
  ) => void;
}

const BreedSearch = ({ breeds, selectedBreeds, updateSearchParams }: Props) => {
  breeds.forEach((b) => fuzzysort.prepare(b));

  const [breedsList, setBreedsList] = useState<string[]>(breeds || []);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const selectedValuesMap = useMemo(
    () =>
      selectedBreeds.reduce<Record<string, boolean>>((acc, item) => {
        acc[item] = true;
        return acc;
      }, {}),
    [selectedBreeds]
  );

  const debounceSearch = debounce((e) => {
    const fuzzyMatch = fuzzysort.go(e.target.value, breeds, {
      threshold: 0.5,
      limit: 5,
      all: false
    });

    const matchList = fuzzyMatch.map((match) => match.target);
    setBreedsList(matchList.length ? matchList : ['No matches found']);
  }, 200);

  const reset = () => {
    setInput('');
    setBreedsList(breeds);
    setOpen(false);
  };

  const selectBreeds = (breed: string) => {
    if (breed === 'No matches found') {
      reset();
      return;
    }
    const removeMatchingInput = selectedBreeds.some((v) => v === breed);

    let newselectedBreeds: string[] = [];

    if (removeMatchingInput) {
      newselectedBreeds = selectedBreeds.filter((v) => v !== breed);
    } else {
      newselectedBreeds = [...selectedBreeds, breed];
    }
    updateSearchParams('breeds', newselectedBreeds);
    reset();
  };

  return (
    <div className="flex items-center py-4">
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              name="breed"
              onKeyDown={(e) => setOpen(e.key !== 'Escape')}
              onMouseDown={() => setOpen((open) => !!breeds.length || !open)}
              onFocus={() => setOpen(true)}
            >
              <Input
                placeholder="Search breed(s) w/ Fuzzy Match"
                onChange={(e) => {
                  debounceSearch(e as unknown as string);
                  setInput(e.target.value);
                }}
                className="truncate italic min-w-[300px]"
                value={input}
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
              {!!selectedBreeds.length && (
                <CommandGroup>
                  {selectedBreeds.map((i) => (
                    <CommandItem
                      key={i}
                      value={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={selectBreeds}
                      className="!text-[#facc16] hover:text-[#facc16]"
                    >
                      {i}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {breeds.length && (
                <CommandGroup>
                  {breedsList.map((i) => (
                    <CommandItem
                      key={i}
                      value={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={selectBreeds}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValuesMap[i]
                            ? 'opacity-50 text-[#facc16]'
                            : 'opacity-0'
                        )}
                      />
                      {i}
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

export default BreedSearch;
