/**
 * The look of `Tabs`, shared with `SegmentedControl` so a pill switch looks
 * the same whether it swaps panels or picks a value.
 */
export const tabStyles = {
  base: "inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
  disabled: "cursor-not-allowed opacity-50 hover:border-transparent hover:bg-transparent hover:text-gray-500",
  underline: {
    list: "gap-4",
    tab: "border-b-2 px-1 py-2 text-sm font-medium leading-tight",
    selected: "border-primary-600 text-primary-600",
    idle: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
  },
  pill: {
    list: "gap-1 rounded-lg bg-gray-100 p-1",
    tab: "rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
    selected: "bg-white text-primary-600 shadow-xs",
    idle: "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
  },
};
