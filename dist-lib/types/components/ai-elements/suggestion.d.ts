import type { ComponentProps } from "react";
import { type ButtonProps } from "../ui/button";
export type SuggestionsProps = ComponentProps<"div">;
export declare function Suggestions({ className, ...props }: SuggestionsProps): import("react").JSX.Element;
export type SuggestionProps = Omit<ButtonProps, "onClick"> & {
    suggestion: string;
    onClick?: (suggestion: string) => void;
};
export declare function Suggestion({ suggestion, onClick, children, className, variant, size, ...props }: SuggestionProps): import("react").JSX.Element;
