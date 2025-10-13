import { SearchIcon } from "lucide-react";
import type { ChangeEvent } from "react";

type SearchProps = {
  value: string;
  setValue: (value: string) => void;
};
export const Search = ({ setValue, value }: SearchProps) => (
  <div className="relative flex w-full flex-wrap items-stretch">
    <input
      type="search"
      className="text-neutral-700 relative m-0 -mr-px block w-[1%] min-w-0 flex-auto rounded-l border-2 border-solid border-border bg-background-dark px-3 py-1.5 text-base font-normal outline-none transition duration-300 ease-in-out  focus:shadow-te-primary focus:outline-none "
      placeholder="Search"
      aria-label="Search"
      value={value}
      onInput={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
    />
    <button
      className="relative z-[2] flex items-center rounded-r bg-selection px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0"
      type="button"
      id="search-button"
      data-te-ripple-init
      data-te-ripple-color="light"
    >
      <SearchIcon className="h-4 w-4" />
    </button>
  </div>
);
