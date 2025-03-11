import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import fuzzysort from 'fuzzysort';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Star } from 'lucide-react';

type Society = {
  name: string;
  description: string;
  href: string;
  image: string;
  categories: string[];
};

const SocietyList = ({ societies }: { societies: Society[] }) => {
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [search, setSearch] = useState<string>(
    window ? new URLSearchParams(window.location.search).get('q') ?? '' : ''
  );

  const [allCategories] = useState(
    Array.from(new Set(societies.flatMap((society) => society.categories)))
  );

  const [hoveredSociety, setHoveredSociety] = useState<string | null>(null);

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    // check cookies to see if disclaimer has been shown
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }

    const favourites = localStorage.getItem('favourites');
    if (favourites) {
      setFavourites(JSON.parse(favourites));
    }
  }, []);

  return (
    <div>
      <AlertDialog open={showDisclaimer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>THIS IS NOT AN OFFICIAL SITE</AlertDialogTitle>
            <AlertDialogDescription>
              This society list is not an official list. We are in no way
              affiliated with any of the societies listed here, the University
              or the Students' Union. We cannot guarantee the accuracy of the
              information provided.
              <br />
              <br />
              Also you can favourite a society by clicking that appears when you
              hover over the logo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowDisclaimer(false);
                localStorage.setItem('hasSeenDisclaimer', 'true');
              }}
            >
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        // topbar, lock to top
        className="sticky top-0 z-10 bg-background"
      >
        <div className="flex p-4 flex-col-reverse gap-2 md:flex-row">
          <div className="flex gap-1 flex-wrap">
            {allCategories.map((category) => (
              <Badge
                onClick={() => {
                  if (filteredCategories.includes(category)) {
                    setFilteredCategories(
                      filteredCategories.filter((c) => c !== category)
                    );
                  } else {
                    setFilteredCategories([...filteredCategories, category]);
                  }
                }}
                className="whitespace-nowrap hover:bg-primary-foreground hover:text-primary cursor-pointer"
                key={category}
                variant={
                  filteredCategories.includes(category) ? 'default' : 'outline'
                }
              >
                {category}
              </Badge>
            ))}
            <Badge
              onClick={() => setFilteredCategories([])}
              className="whitespace-nowrap hover:bg-primary-foreground hover:text-primary cursor-pointer"
              variant="secondary"
            >
              Clear
            </Badge>
          </div>
          <div className="flex justify-end w-full space-x-2">
            <Input
              className="w-full md:w-72"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search societies..."
            />
          </div>
        </div>
        <Separator />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 m-4">
        {fuzzysort
          .go(
            search,
            societies
              .filter((society) => {
                if (filteredCategories.length === 0) return true;
                return filteredCategories.every((category) =>
                  society.categories.includes(category)
                );
              })
              .sort((a, b) => a.name.localeCompare(b.name))
              .sort((a, b) => {
                if (favourites.includes(a.name) && !favourites.includes(b.name))
                  return -1;
                if (!favourites.includes(a.name) && favourites.includes(b.name))
                  return 1;
                return 0;
              }),
            {
              key: 'name',
              all: true,
            }
          )
          .map(({ obj: society }) => (
            <div className="flex space-x-2 justify-start p-2">
              <Avatar
                className="size-16 my-auto relative"
                onMouseEnter={() => setHoveredSociety(society.name)}
                onMouseLeave={() => setHoveredSociety(null)}
              >
                <AvatarImage className="bg-white" src={society.image} />
                <AvatarFallback>{society.name.slice(0, 2)}</AvatarFallback>
                <Star
                  className={`absolute top-2 left-2 z-5 stroke-primary size-12 border border-transparent ${
                    favourites.includes(society.name) ? 'fill-primary' : ''
                  }`}
                  onClick={() => {
                    let newFavourites = [...favourites];
                    if (favourites.includes(society.name)) {
                      newFavourites = favourites.filter(
                        (s) => s !== society.name
                      );
                    } else {
                      newFavourites.push(society.name);
                    }
                    setFavourites(newFavourites);
                    localStorage.setItem(
                      'favourites',
                      JSON.stringify(newFavourites)
                    );
                  }}
                  visibility={
                    hoveredSociety === society.name ? 'visible' : 'hidden'
                  }
                />
              </Avatar>
              <div className="my-auto space-y-1">
                <a
                  className={`font-bold hover:underline hover:cursor-pointer ${
                    favourites.includes(society.name) ? 'text-primary' : ''
                  }`}
                  href={society.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {society.name}
                </a>
                <div className="flex gap-1 flex-wrap">
                  {society.categories.map((category) => (
                    <Badge
                      onClick={() => {
                        if (filteredCategories.includes(category)) {
                          setFilteredCategories(
                            filteredCategories.filter((c) => c !== category)
                          );
                        } else {
                          setFilteredCategories([
                            ...filteredCategories,
                            category,
                          ]);
                        }
                      }}
                      className="whitespace-nowrap hover:bg-primary-foreground hover:text-primary cursor-pointer"
                      key={category}
                      variant={
                        filteredCategories.includes(category)
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
      <a
        href="https://github.com/tonyaellie/society-list"
        target="_blank"
        rel="noreferrer"
        className="flex justify-center p-4 underline hover:cursor-pointer"
      >
        View on GitHub
      </a>
    </div>
  );
};

export default SocietyList;
