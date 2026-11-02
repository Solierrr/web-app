import { expect } from "vitest";
import { axe } from "vitest-axe";

export async function expectNoA11yViolations(container: HTMLElement) {
  const { violations } = await axe(container);
  expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.html) }))).toEqual([]);
}
