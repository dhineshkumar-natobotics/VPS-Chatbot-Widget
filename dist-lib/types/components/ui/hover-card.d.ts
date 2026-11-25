import { PreviewCard } from "@base-ui/react/preview-card";
export declare const createHoverCardHandle: typeof PreviewCard.createHandle;
export declare function HoverCard(props: PreviewCard.Root.Props): import("react").JSX.Element;
export declare function HoverCardTrigger(props: PreviewCard.Trigger.Props): import("react").JSX.Element;
export declare function HoverCardContent({ className, side, sideOffset, align, alignOffset, ...props }: PreviewCard.Popup.Props & Pick<PreviewCard.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">): import("react").JSX.Element;
