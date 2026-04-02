"use client";

import { useId } from "react";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TextFieldProps = Omit<
    React.ComponentProps<typeof Input>,
    "id"
> & {
    label: string;
    description?: string;
    /** Override id (otherwise a stable id is generated). */
    id?: string;
    className?: string;
    fieldClassName?: string;
    labelClassName?: string;
};

/**
 * Accessible label + text input; composes {@link FormField} with {@link Input}.
 */
export function TextField({
    label,
    description,
    id: idProp,
    fieldClassName,
    labelClassName,
    className,
    ...inputProps
}: TextFieldProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
        <FormField
            label={label}
            htmlFor={id}
            description={description}
            className={fieldClassName}
            labelClassName={labelClassName}
        >
            <Input id={id} className={cn(className)} {...inputProps} />
        </FormField>
    );
}
