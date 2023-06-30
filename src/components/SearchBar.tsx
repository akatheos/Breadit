"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subbreadit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const [input, setInput] = useState<string>("");
  const commandRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subbreadit & {
        _count: Prisma.SubbreaditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });
  const request = debounce(async () => {
    refetch();
  }, 450);
  const debounceQuery = useCallback(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useOnClickOutside(commandRef, () => {
    setInput("");
  });
  useEffect(() => {
    setInput("");
  }, [pathname]);

  return (
    <Command
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
      ref={commandRef}
    >
      <CommandInput
        isLoading={isFetching}
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceQuery();
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search Breadit"
      />
      {input.length > 0 ? (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading="Subbreadits">
              {queryResults?.map((subbreadit) => (
                <CommandItem
                  key={subbreadit.id}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  value={subbreadit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subbreadit.name}`}>r/{subbreadit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
