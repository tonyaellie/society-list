import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import fuzzysort from 'fuzzysort';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Society = {
  name: string;
  description: string;
  href: string;
  image: string;
  categories: string[];
};

const ModeToggle = () => {
  const [theme, setThemeState] = useState<'theme-light' | 'dark' | 'system'>(
    'theme-light'
  );

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setThemeState(isDarkMode ? 'dark' : 'theme-light');
  }, []);

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-10">
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemeState('theme-light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SocietyList = ({ societies }: { societies: Society[] }) => {
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');

  const [allCategories] = useState(
    Array.from(new Set(societies.flatMap((society) => society.categories)))
  );

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // check cookies to see if disclaimer has been shown
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
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
            <ModeToggle />
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
              .sort((a, b) => a.name.localeCompare(b.name)),
            {
              key: 'name',
              all: true,
            }
          )
          .map(({ obj: society }) => (
            <div className="flex space-x-2 justify-start p-2">
              <Avatar className="size-16 my-auto">
                <AvatarImage className="bg-white" src={society.image} />
                <AvatarFallback>{society.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="my-auto space-y-1">
                <a
                  className="font-bold hover:underline hover:cursor-pointer"
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
