import { addons, types } from "storybook/manager-api";
import * as React from "react";
import { IconBrandGithub, IconMaximize } from "@tabler/icons-react";
import { solariaTheme } from "./theme.ts";

addons.setConfig({ theme: solariaTheme });

addons.register("solaria/repository", () => {
  addons.add("solaria/repository/link", {
    type: types.TOOLEXTRA,
    title: "Prévia e GitHub",
    render: (): React.ReactElement => (
      <>
        <button
          type="button"
          aria-label="Restaurar tamanho da prévia"
          title="Arraste o canto inferior direito da prévia para redimensionar. Clique para restaurar."
          onClick={() => {
            const preview = document.getElementById("storybook-preview-wrapper");
            preview?.style.removeProperty("width");
            preview?.style.removeProperty("height");
          }}>
          <IconMaximize size={20} stroke={1.8} aria-hidden="true" />
        </button>
        <a
          className="solaria-toolbar-link"
          href="https://github.com/Solierrr/web-app"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Repositório no GitHub"
          title="GitHub">
          <IconBrandGithub size={20} stroke={1.8} aria-hidden="true" />
        </a>
      </>
    ),
  });
});
