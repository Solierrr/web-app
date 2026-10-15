/** Illustrative fixtures for the local dashboard pilot; never used as live metrics. */
export function getDashboardMock(days: number) {
  const labels = Array.from({ length: days }, (_, index) => String(index + 1));
  const viewHistory = [
    186, 203, 198, 224, 251, 236, 215, 232, 264, 281, 257, 245, 268, 292, 305, 278, 260, 283, 314, 298, 286, 309, 332, 319, 294, 306, 341, 328, 352,
    367,
  ];
  const contactHistory = [11, 14, 13, 16, 19, 17, 15, 18, 21, 20, 18, 17, 22, 25, 23, 21, 19, 24, 27, 25, 22, 26, 29, 27, 24, 26, 30, 28, 32, 34];
  const views = viewHistory.slice(-days);
  const contacts = contactHistory.slice(-days);
  const previousViews = views.map((value, index) => value - [21, 32, 18, 27, 24, 35, 19][index % 7]);
  const previousContacts = contacts.map((value, index) => value - [2, 3, 1, 4, 2, 3, 2][index % 7]);
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  return {
    labels,
    views,
    contacts,
    totals: { views: sum(views), contacts: sum(contacts), offers: 24, requests: 8 },
    changes: {
      views: ((sum(views) - sum(previousViews)) / sum(previousViews)) * 100,
      contacts: ((sum(contacts) - sum(previousContacts)) / sum(previousContacts)) * 100,
    },
    categories: [46, 31, 23],
    power: [18, 32, 27, 15, 8],
    ranking: [42, 35, 26, 18],
  };
}
