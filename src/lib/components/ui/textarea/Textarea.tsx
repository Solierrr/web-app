interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
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
export default function Textarea({ name, placeholder, className, ...props }: TextareaProps) {
  return (
    <div className={`flex w-fit bg-input-bg rounded-medium items-center-safe ${className ?? ""}`}>
      <textarea
        className="w-full min-w-0 bg-transparent px-4 py-2 text-black placeholder:text-input-text placeholder:select-none caret-orange focus:outline-0 font-medium resize-none input-scrollbar cursor-text read-only:cursor-default disabled:cursor-not-allowed"
        {...props}
        placeholder={placeholder}
        aria-label={props["aria-label"] ?? name}
        name={name}
      />
    </div>
  );
}
