import type { FormEvent, ReactNode } from "react"
import Input from "@@/ui/input/Input"
import { PasswordInput } from "@@/ui/input/Input.presets"
import { PrimaryButton } from "@@/ui/button/Button.presets"

export interface AccessField {
    name:        string
    placeholder: string
    type?:       string
    password?:   boolean
}

interface AccessProps {
    heading:     string
    helperText?: ReactNode
    fields:      AccessField[]
    submitLabel: string
    footer?:     ReactNode
    onSubmit?:   (event: FormEvent<HTMLFormElement>) => void
}

export default function Access({ heading, helperText, fields, submitLabel, footer, onSubmit }: AccessProps) {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        onSubmit?.(event)
    }

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex w-full flex-col justify-center gap-10 px-10 sm:px-20 lg:w-1/2">
                <div className="flex flex-col gap-2">
                    <h1 className="text-hero font-bold text-orange">{heading}</h1>
                    {helperText && <p className="text-black/70">{helperText}</p>}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {fields.map((field) => (
                        field.password ? (
                            <PasswordInput key={field.name} name={field.name} placeholder={field.placeholder} className="w-full" />
                        ) : (
                            <Input key={field.name} name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} className="w-full" />
                        )
                    ))}
                    <PrimaryButton type="submit" content={submitLabel} description={submitLabel} rounded className="w-fit" />
                </form>

                {footer}
            </div>

            <div className="hidden bg-orange lg:block lg:w-1/2" />
        </div>
    )
}
