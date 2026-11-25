import { PreviewCard } from "@base-ui/react/preview-card";
import { cn } from "../../lib/cn";

export const createHoverCardHandle = PreviewCard.createHandle;

export function HoverCard(props: PreviewCard.Root.Props) {
  return <PreviewCard.Root {...props} />;
}

export function HoverCardTrigger(props: PreviewCard.Trigger.Props) {
  return <PreviewCard.Trigger data-slot="hover-card-trigger" {...props} />;
}

export function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  ...props
}: PreviewCard.Popup.Props &
  Pick<PreviewCard.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="vps-hover-card-positioner"
      >
        <PreviewCard.Popup
          data-slot="hover-card-content"
          {...props}
          className={(state) => cn(
            "vps-hover-card",
            typeof className === "function" ? className(state) : className
          )}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  );
}
