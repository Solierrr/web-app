export function useRecentPages(context: string): string[] {
  return context === "storybook-empty" ? [] : ["projects", "messages"];
}
