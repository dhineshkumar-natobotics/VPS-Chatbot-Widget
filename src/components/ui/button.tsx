import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

export const buttonVariants = cva("vps-ui-button", {
  variants: {
    variant: {
      default: "vps-ui-button--default",
      outline: "vps-ui-button--outline",
      secondary: "vps-ui-button--secondary",
      ghost: "vps-ui-button--ghost",
      destructive: "vps-ui-button--destructive",
      link: "vps-ui-button--link",
    },
    size: {
      default: "vps-ui-button--size-default",
      xs: "vps-ui-button--size-xs",
      sm: "vps-ui-button--size-sm",
      lg: "vps-ui-button--size-lg",
      icon: "vps-ui-button--size-icon",
      "icon-xs": "vps-ui-button--size-icon-xs",
      "icon-sm": "vps-ui-button--size-icon-sm",
      "icon-lg": "vps-ui-button--size-icon-lg",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      type="button"
      data-slot="button"
      {...props}
      className={(state) => cn(
        buttonVariants({ variant, size }),
        typeof className === "function" ? className(state) : className
      )}
    />
  );
}
