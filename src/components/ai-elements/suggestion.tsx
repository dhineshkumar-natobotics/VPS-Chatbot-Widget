import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../ui/button";

export type SuggestionsProps = ComponentProps<"div">;

export function Suggestions({ className, ...props }: SuggestionsProps) {
  return (
    <div
      {...props}
      className={cn("flex scroll-fade-x scrollbar-none gap-2 overflow-x-auto overscroll-x-contain", className)}
      data-slot="suggestions"
    />
  );
}

export type SuggestionProps = Omit<ButtonProps, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export function Suggestion({
  suggestion,
  onClick,
  children,
  className,
  variant = "outline",
  size = "sm",
  ...props
}: SuggestionProps) {
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      className={(state) => cn("shrink-0", typeof className === "function" ? className(state) : className)}
      onClick={() => onClick?.(suggestion)}
    >
      {children ?? suggestion}
    </Button>
  );
}
