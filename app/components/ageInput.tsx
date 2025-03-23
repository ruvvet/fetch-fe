import { Input } from '~/components/ui/input';
import { SearchParams } from '~/routes/dogs';

interface Props {
  ageMin?: number;
  ageMax?: number;
  updateSearchParams: (
    key: keyof SearchParams,
    value: string | string[]
  ) => void;
  isLoading?: boolean;
}

const AgeInput = ({ ageMin, ageMax, updateSearchParams }: Props) => {
  return (
    <div className="flex flex-row py-4">
      <Input
        value={ageMin}
        type="number"
        min="0"
        max="30"
        placeholder="Min Age"
        onChange={(e) => {
          if (parseInt(e.target.value) < 0 || parseInt(e.target.value) > 30) {
            return;
          }
          updateSearchParams('ageMin', e.target.value);
        }}
        className="truncate italic min-w-[150px]"
      />
      <Input
        value={ageMax}
        type="number"
        min="0"
        max="30"
        placeholder="Max Age"
        onChange={(e) => {
          if (parseInt(e.target.value) < 0 || parseInt(e.target.value) > 30) {
            return;
          }
          updateSearchParams('ageMax', e.target.value);
        }}
        className="truncate italic min-w-[150px]"
      />
    </div>
  );
};

export default AgeInput;
