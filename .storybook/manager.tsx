import { addons, types } from "storybook/manager-api";
import * as React from "react";
import { IconBrandGithub } from "@tabler/icons-react";
import { solariaTheme } from "./theme.ts";

addons.setConfig({ theme: solariaTheme });

addons.register("solaria/repository", () => {
  addons.add("solaria/repository/link", {
    type: types.TOOLEXTRA,
    title: "GitHub",
    render: (): React.ReactElement => (
      <a
        className="solaria-toolbar-link"
        href="https://github.com/Solierrr/web-app"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Repositório no GitHub"
        title="GitHub">
        <IconBrandGithub size={20} stroke={1.8} aria-hidden="true" />
      </a>
    ),
  });
});
