const { default: dynamic } = require("next/dynamic");

const Searchbar = dynamic(() => import("../searchBar"), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md" />
  ),
});

export function SearchbarWrapper() {
  return <Searchbar />;
}
