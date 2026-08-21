interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name:         string;
  placeholder?: string;

  className?: string;
}

/**
 * Textarea
 *
 * @param props - Propriedades do componente.
 * @param props.name - Nome e rótulo acessível do campo.
 * @param props.placeholder - Texto exibido quando o campo está vazio.
 *
 * @returns O componente de textarea renderizado.
 */
export function Textarea({ name, placeholder, className, ...props }: TextareaProps) {
  return (
    <div className={`flex w-fit bg-input-bg rounded-medium items-center-safe ${className ?? ""}`}>
      <textarea className="px-4 py-2 text-black placeholder:text-input-text placeholder:select-none focus:outline-0 font-medium resize-none input-scrollbar"
      {...props} placeholder={placeholder} aria-label={name} name={name} />
    </div>
  );
}
