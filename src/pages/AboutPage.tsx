import Button from "@@/ui/button/Button";
import { IconButton, SecondaryButton } from "@@/ui/button/Button.presets";
import Colors from "@/shared/styles/colors/colors.enum";
import sleep from "@/utils/sleep";

function ButtonActionCases() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-slate-950">
        Button — action / loading
      </h2>
      <div className="flex flex-wrap items-center gap-4">
        <Button
          content="Ação rápida (500ms)"
          description="Dispara uma ação rápida"
          action={() => sleep(500)}
        />
        <Button
          content="Ação lenta (4s)"
          description="Dispara uma ação lenta"
          action={() => sleep(4000)}
        />
        <SecondaryButton
          content="Ação que falha"
          description="Dispara uma ação que rejeita"
          action={async () => {
            await sleep(1000);
            throw new Error("Falha simulada");
          }}
        />
        <IconButton
          icon="heart"
          description="Ação apenas com ícone"
          action={() => sleep(1500)}
        />
        <Button
          content="Desabilitado"
          description="Não deve disparar a ação"
          bgColor={Colors.BLACK}
          action={() => sleep(1500)}
          disabled
        />
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <section className="space-y-4">
      <p className="text-sm  font-medium  uppercase tracking-wide text-slate-500">
        Sobre
      </p>
      <h1 className="text-3xl font-bold text-slate-950">Sobre o projeto</h1>
      <p className="max-w-2xl text-base leading-7 text-slate-600">
        Esta rota serve como exemplo para novas paginas dentro da aplicacao.
      </p>

      <ButtonActionCases />
    </section>
  );
}
