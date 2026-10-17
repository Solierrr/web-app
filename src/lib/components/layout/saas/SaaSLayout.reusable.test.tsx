import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SaaSNavigation } from "./SaaSLayout.reusable";
import { getOperationalNavigation } from "./SaaSLayout.presets";
import { DEFAULT } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

vi.mock("@@/layout/sidebar/recent/Recent", () => ({ default: () => null }));

const groups = getOperationalNavigation({ company: false, companyType: null, platformAdmin: false });

describe("SaaSNavigation active page", () => {
  it.each([routePaths.operationalChatbot(DEFAULT), `${routePaths.inbox(DEFAULT)}/conversation-1`])(
    "marks only the most specific page for %s",
    (path) => {
      const { container } = render(
        <MemoryRouter initialEntries={[path]}>
          <SaaSNavigation groups={groups} lang={DEFAULT} context="personal" collapsed={false} onNavigate={() => {}} />
        </MemoryRouter>,
      );
      const selected = container.querySelectorAll('a[aria-current="page"]');
      expect(selected).toHaveLength(1);
      expect(selected[0]).toHaveAttribute("href", path.startsWith(routePaths.inbox(DEFAULT)) ? routePaths.inbox(DEFAULT) : path);
      expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
    },
  );
});
