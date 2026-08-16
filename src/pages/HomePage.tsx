import { Button } from "@/components/ui/Button"
import Colors from "@/domain/enum/colors"

export function HomePage() {
  return (
    <section className="flex flex-col items-start gap-4 ml-20">
      <Button name="btn-orange" description="Ação principal" content="Orange" color={Colors.Orange} />
      <Button name="btn-green" description="Ação de sucesso" content="Green" color={Colors.Green} />
      <Button name="btn-hyperblue" description="Ação de link" content="HyperBlue" color={Colors.HyperBlue} />
      <Button name="btn-black" description="Ação neutra" content="Black" color={Colors.Black} />

      <Button name="btn-rounded" description="Botão arredondado" content="Rounded" color={Colors.Orange} className="rounded-full" />
      <Button name="btn-disabled" description="Botão desabilitado" content="Disabled" color={Colors.Orange} disabled />
      <Button name="btn-onclick" description="Botão com onClick" content="Click me" color={Colors.Green} onClick={() => console.log("clicked")} />
    </section>
  )
}
