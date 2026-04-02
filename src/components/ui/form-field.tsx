import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
    label: string;
    htmlFor?: string;
    description?: string;
    className?: string;
    labelClassName?: string;
    children: ReactNode;
};

/**
 * Label + optional description + control. Use with inputs, selects, or custom controls.
 */
export function FormField({
    label,
    htmlFor,
    description,
    className,
    labelClassName,
    children,
}: FormFieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <label
                htmlFor={htmlFor}
                className={cn(
                    "text-sm font-medium text-zinc-800",
                    labelClassName,
                )}
            >
                {label}
            </label>
            {description ? (
                <p className="text-xs text-zinc-500">{description}</p>
            ) : null}
            {children}
        </div>
    );
}
