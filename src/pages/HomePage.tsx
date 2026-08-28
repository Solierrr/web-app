import Button from "@@/ui/button/Button";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "@@/ui/button/Button.presets";
import Input from "@@/ui/input/Input";
import {
  DefaultInput,
  SearchInput,
  PasswordInput,
} from "@@/ui/input/Input.presets";
import Select from "@@/ui/select/Select";
import { DefaultSelect, BooleanSelect } from "@@/ui/select/Select.presets";
import Textarea from "@@/ui/textarea/Textarea";
import {
  DefaultTextarea,
  CharCountTextarea,
} from "@@/ui/textarea/Textarea.presets";
import Colors from "@/shared/styles/colors/colors.enum";

export function HomePage() {
  return (
    <section className="flex flex-col items-start gap-4 ml-20">
      <p className="text-hero">Hero</p>
      <p className="text-display">Display</p>
      <p className="text-heading">Heading</p>
      <p className="text-title">Title</p>
      <p className="text-subtitle">Subtitle</p>
      <p className="text-body">Body</p>
      <p className="text-caption">Caption</p>

      <p className="text-hero">Lorem ipsum dolor sit amet.</p>
      <p className="text-display">Lorem ipsum dolor sit amet.</p>
      <p className="text-heading">Lorem ipsum dolor sit amet.</p>
      <p className="text-title">Lorem ipsum dolor sit amet.</p>
      <p className="text-subtitle">Lorem ipsum dolor sit amet.</p>
      <p className="text-body">Lorem ipsum dolor sit amet.</p>
      <p className="text-caption">Lorem ipsum dolor sit amet.</p>

      <h1>Teste h1 teste teste</h1>
      <h2>Teste h2 teste teste</h2>
      <h3>Teste h3 teste teste</h3>
      <h4>Teste h4 teste teste</h4>
      <h5>Teste h5 teste teste</h5>
      <h6>Teste h6 teste teste</h6>

      <sub>Teste subscrito teste teste</sub>
      <sup>Teste sobrescrito teste teste</sup>
      <p>Teste paragrafo teste teste</p>

      <strong>Texto strong importante</strong>
      <em>Texto enfatizado</em>
      <b>Texto em negrito</b>
      <i>Texto em itálico</i>
      <u>Texto sublinhado</u>
      <s>Texto riscado</s>
      <mark>Texto destacado</mark>
      <small>Texto pequeno</small>

      {/* Input */}
      <Input name="input-basico" placeholder="Digite algo..." />
      <Input name="input-rounded" placeholder="Busca..." rounded />

      <Input
        name="input-icone"
        placeholder="Buscar..."
        icon={{ name: "search" }}
      />
      <Input
        name="input-icone-inverse"
        placeholder="Buscar..."
        icon={{ name: "search", inverse: true }}
      />
      <Input
        name="input-rounded-inverse"
        placeholder="Buscar..."
        rounded
        icon={{ name: "user", inverse: true }}
      />

      <Input
        name="input-icone-button"
        placeholder="Clique no ícone"
        icon={{ name: "x", onClick: () => console.log("ícone clicado") }}
      />

      <Input name="input-disabled" placeholder="Desabilitado" disabled />
      <Input name="input-password" placeholder="Senha" type="password" />
      <Input
        name="input-default-value"
        placeholder="Com valor inicial"
        defaultValue="valor inicial"
      />
      <Input name="input-required" placeholder="Obrigatório" required />

      {/* Input presets */}
      <DefaultInput name="preset-default" placeholder="Default" />
      <SearchInput name="preset-search" placeholder="Buscar..." />
      <PasswordInput name="preset-password" placeholder="Senha" />

      {/* Button */}
      <Button
        name="btn-orange"
        description="Ação principal"
        content="Orange"
        bgColor={Colors.Orange}
      />
      <Button
        name="btn-green"
        description="Ação de sucesso"
        content="Green"
        bgColor={Colors.Green}
      />
      <Button
        name="btn-hyperlink"
        description="Ação de link"
        content="HyperLink"
        bgColor={Colors.HyperLink}
      />
      <Button
        name="btn-black"
        description="Ação neutra"
        content="Black"
        bgColor={Colors.Black}
        txtColor={Colors.White}
      />

      <Button
        name="btn-rounded"
        description="Botão arredondado"
        content="Rounded"
        bgColor={Colors.Orange}
        rounded
      />
      <Button
        name="btn-disabled"
        description="Botão desabilitado"
        content="Disabled"
        bgColor={Colors.Orange}
        disabled
      />
      <Button
        name="btn-onclick"
        description="Botão com onClick"
        content="Click me"
        bgColor={Colors.Green}
        onClick={() => console.log("clicked")}
      />

      <Button
        name="btn-icone"
        description="Botão com ícone"
        content="Buscar"
        bgColor={Colors.Green}
        icon={{ name: "search" }}
      />
      <Button
        name="btn-icone-inverse"
        description="Botão com ícone invertido"
        content="Buscar"
        bgColor={Colors.Green}
        icon={{ name: "search", inverse: true }}
      />
      <Button
        name="btn-icone-only"
        description="Botão só com ícone"
        bgColor={Colors.HyperLink}
        icon={{ name: "user" }}
      />

      {/* Button presets */}
      <PrimaryButton
        name="preset-btn-primary"
        description="Ação principal"
        content="Primary"
      />
      <SecondaryButton
        name="preset-btn-secondary"
        description="Ação secundária"
        content="Secondary"
      />
      <IconButton
        name="preset-btn-icon"
        description="Botão de ícone"
        icon="settings"
      />

      {/* Select */}
      <Select
        name="select-basico"
        options={["Opção A", "Opção B", "Opção C"]}
      />

      <Select
        name="select-tupla"
        placeholder="Escolha um estado..."
        options={[
          ["São Paulo", "SP"],
          ["Rio de Janeiro", "RJ"],
          ["Minas Gerais", "MG"],
        ]}
        onChange={(value) => console.log("selecionado:", value)}
      />

      <Select
        name="select-rounded"
        rounded
        defaultValue="b"
        options={["Opção A", "Opção B", "Opção C"]}
      />

      <Select
        name="select-disabled"
        disabled
        defaultValue="a"
        options={["Opção A", "Opção B"]}
      />

      <Select
        name="select-controlado"
        value="RJ"
        options={[
          ["São Paulo", "SP"],
          ["Rio de Janeiro", "RJ"],
        ]}
      />

      {/* Select presets */}
      <DefaultSelect
        name="preset-select-default"
        options={["Opção A", "Opção B"]}
      />
      <BooleanSelect
        name="preset-select-boolean"
        onChange={(value) => console.log("selecionado:", value)}
      />

      {/* Textarea */}
      <Textarea name="textarea-basico" placeholder="Escreva algo..." />
      <Textarea name="textarea-outro" placeholder="Escreva algo..." />
      <Textarea name="textarea-disabled" placeholder="Desabilitado" disabled />
      <Textarea name="textarea-rows" placeholder="Com mais linhas" rows={5} />
      <Textarea name="textarea-default-value" defaultValue="Valor inicial" />
      <Textarea name="textarea-required" placeholder="Obrigatório" required />

      {/* Textarea presets */}
      <DefaultTextarea name="preset-textarea-default" placeholder="Default" />
      <CharCountTextarea
        name="preset-textarea-charcount"
        placeholder="Escreva algo..."
        maxLength={140}
      />
    </section>
  );
}
