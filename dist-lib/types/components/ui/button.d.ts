import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps } from "class-variance-authority";
export declare const buttonVariants: (props?: ({
    variant?: "default" | "link" | "outline" | "secondary" | "ghost" | "destructive" | null | undefined;
    size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;
export declare function Button({ className, variant, size, ...props }: ButtonProps): import("react").JSX.Element;
