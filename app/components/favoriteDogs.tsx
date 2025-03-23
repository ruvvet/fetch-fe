import { X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Dog } from '~/routes/dogs.search';

interface Props {
  favorites: Dog[];
  updateFavorites: (id: string, add: boolean) => void;
}
const FavoriteDogs = ({ favorites, updateFavorites }: Props) => {
  const renderDog = (dog: Dog) => (
    <Card key={dog.id} className="flex flex-col w-[300px] items-center m-2">
      <CardContent className="flex flex-col items-center pt-4">
        <div className="pt-2 pb-8 px-2 background-color-white">
          <img src={dog.img} className="w-[120px] h-[120px] object-cover" />
        </div>
        <div>
          <p>Name: {dog.name}</p>
          <p>Age: {dog.age}</p>
          <p>Breed: {dog.breed}</p>
          <p>Zip: {dog.zip_code}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => updateFavorites(dog.id, false)}
          variant="outline"
          size="icon"
        >
          <X />
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-row flex-wrap max-w-[70%]">
      {favorites.map((f) => renderDog(f))}
    </div>
  );
};

export default FavoriteDogs;
