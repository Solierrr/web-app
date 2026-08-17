import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { DefaultInput, SearchInput, PasswordInput } from "@/components/ui/Input.presets"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import Colors from "@/domain/enum/colors"

export function HomePage() {
  return (
    <section className="flex flex-col items-start gap-4 ml-20">
      {/* Input */}
      <Input name="input-basico" placeholder="Digite algo..." />
      <Input name="input-rounded" placeholder="Busca..." rounded />

      <Input name="input-icone" placeholder="Buscar..." icon={{ name: "search" }} />
      <Input name="input-icone-inverse" placeholder="Buscar..." icon={{ name: "search", inverse: true }} />
      <Input name="input-rounded-inverse" placeholder="Buscar..." rounded icon={{ name: "user", inverse: true }} />

      <Input name="input-icone-button" placeholder="Clique no ícone" icon={{ name: "x", onClick: () => console.log("ícone clicado") }} />

      <Input name="input-disabled" placeholder="Desabilitado" disabled />
      <Input name="input-password" placeholder="Senha" type="password" />
      <Input name="input-default-value" placeholder="Com valor inicial" defaultValue="valor inicial" />
      <Input name="input-required" placeholder="Obrigatório" required />

      {/* Input presets */}
      <DefaultInput name="preset-default" placeholder="Default" />
      <SearchInput name="preset-search" placeholder="Buscar..." />
      <PasswordInput name="preset-password" placeholder="Senha" />

      {/* Button */}
      <Button name="btn-orange" description="Ação principal" content="Orange" bgColor={Colors.Orange} />
      <Button name="btn-green" description="Ação de sucesso" content="Green" bgColor={Colors.Green} />
      <Button name="btn-hyperblue" description="Ação de link" content="HyperBlue" bgColor={Colors.HyperBlue} />
      <Button name="btn-black" description="Ação neutra" content="Black" bgColor={Colors.Black} txtColor={Colors.White} />

      <Button name="btn-rounded" description="Botão arredondado" content="Rounded" bgColor={Colors.Orange} rounded />
      <Button name="btn-disabled" description="Botão desabilitado" content="Disabled" bgColor={Colors.Orange} disabled />
      <Button name="btn-onclick" description="Botão com onClick" content="Click me" bgColor={Colors.Green} onClick={() => console.log("clicked")} />

      {/* Select */}
      <Select name="select-basico" options={["Opção A", "Opção B", "Opção C"]} />

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

      <Select name="select-rounded" rounded defaultValue="b" options={["Opção A", "Opção B", "Opção C"]} />

      <Select name="select-disabled" disabled defaultValue="a" options={["Opção A", "Opção B"]} />

      <Select
        name="select-controlado"
        value="RJ"
        options={[
          ["São Paulo", "SP"],
          ["Rio de Janeiro", "RJ"],
        ]}
      />

      {/* Textarea */}
      <Textarea name="textarea-basico" placeholder="Escreva algo..." />
      <Textarea name="textarea-outro" placeholder="Escreva algo..." />
      <Textarea name="textarea-disabled" placeholder="Desabilitado" disabled />
      <Textarea name="textarea-rows" placeholder="Com mais linhas" rows={5} />
      <Textarea name="textarea-default-value" defaultValue="Valor inicial" />
      <Textarea name="textarea-required" placeholder="Obrigatório" required />
    </section>
  )
}
