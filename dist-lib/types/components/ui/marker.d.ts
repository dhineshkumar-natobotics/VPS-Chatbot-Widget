import type { ComponentProps } from "react";
export declare function Marker({ className, variant, ...props }: ComponentProps<"div"> & {
    variant?: "default" | "border" | "separator";
}): import("react").JSX.Element;
export declare function MarkerIcon({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
export declare function MarkerContent({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
