import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { safeHref } from "../../lib/safeHref";
import { Button, type ButtonProps } from "../ui/button";
import { createHoverCardHandle, HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

export type InlineCitationProps = ComponentProps<"span">;
export function InlineCitation({ className, ...props }: InlineCitationProps) {
  return <span className={cn("inline-citation", className)} {...props} />;
}

export type InlineCitationTextProps = ComponentProps<"span">;
export function InlineCitationText(props: InlineCitationTextProps) {
  return <span {...props} />;
}

type CardNavigation = {
  handle: ReturnType<typeof createHoverCardHandle>;
  openDelay: number;
  closeDelay: number;
  trigger: HTMLElement | null;
  popup: HTMLElement | null;
  focusRequested: boolean;
};

const CardNavigationContext = createContext<CardNavigation | null>(null);

function focusCard(navigation: CardNavigation) {
  if (!navigation.popup || !navigation.focusRequested || !navigation.handle.isOpen) return;
  navigation.focusRequested = false;
  navigation.popup.focus();
}

export type InlineCitationCardProps = ComponentProps<typeof HoverCard> & {
  openDelay?: number;
  closeDelay?: number;
};
export function InlineCitationCard({
  handle,
  onOpenChange,
  openDelay = 80,
  closeDelay = 180,
  ...props
}: InlineCitationCardProps) {
  const [internalHandle] = useState(() => createHoverCardHandle());
  const activeHandle = handle ?? internalHandle;
  const navigation = useMemo<CardNavigation>(() => ({
    handle: activeHandle,
    openDelay,
    closeDelay,
    trigger: null,
    popup: null,
    focusRequested: false,
  }), [activeHandle, openDelay, closeDelay]);

  return (
    <CardNavigationContext.Provider value={navigation}>
      <HoverCard
        {...props}
        handle={activeHandle}
        onOpenChange={(open, details) => {
          onOpenChange?.(open, details);
          if (!open && details.reason === "escape-key" && navigation.popup?.contains(document.activeElement)) {
            navigation.trigger?.focus();
          }
        }}
      />
    </CardNavigationContext.Provider>
  );
}

function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

export type InlineCitationCardTriggerProps = Omit<ButtonProps, "render"> & {
  sources: string[];
  delay?: number;
  closeDelay?: number;
};

export function InlineCitationCardTrigger({
  sources,
  delay,
  closeDelay,
  id,
  children,
  onClick,
  ...props
}: InlineCitationCardTriggerProps) {
  const navigation = useContext(CardNavigationContext);
  const fallbackId = useId();
  const triggerId = id ?? fallbackId;
  const primary = sources[0];
  const label = primary ? sourceLabel(primary) : "Source";

  return (
    <HoverCardTrigger
      id={triggerId}
      handle={navigation?.handle}
      delay={delay ?? navigation?.openDelay ?? 80}
      closeDelay={closeDelay ?? navigation?.closeDelay ?? 180}
      render={
        <Button
          variant="secondary"
          size="xs"
          aria-haspopup="dialog"
          {...props}
          onClick={(event) => {
            onClick?.(event);
            if (!navigation || event.defaultPrevented) return;
            navigation.trigger = event.currentTarget;
            navigation.focusRequested = true;
            navigation.handle.open(triggerId);
            focusCard(navigation);
          }}
        />
      }
    >
      {children ?? (sources.length > 1 ? `${label} +${sources.length - 1}` : label)}
    </HoverCardTrigger>
  );
}

export type InlineCitationCardBodyProps = ComponentProps<typeof HoverCardContent>;
export function InlineCitationCardBody({ ref, onBlur, ...props }: InlineCitationCardBodyProps) {
  const navigation = useContext(CardNavigationContext);
  return (
    <HoverCardContent
      tabIndex={-1}
      role="dialog"
      aria-label="Source preview"
      {...props}
      ref={(element) => {
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
        if (!navigation) return;
        navigation.popup = element;
        if (element) focusCard(navigation);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!navigation || event.defaultPrevented) return;
        if (event.relatedTarget !== navigation.trigger && !event.currentTarget.contains(event.relatedTarget)) {
          navigation.handle.close();
        }
      }}
    />
  );
}

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;
type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;
type EmblaPlugins = NonNullable<Parameters<typeof useEmblaCarousel>[1]>;

const CarouselContext = createContext<{
  viewportRef: UseEmblaCarouselType[0];
  api: UseEmblaCarouselType[1];
  selected: number;
  count: number;
} | null>(null);

function useInlineCitationCarousel() {
  const carousel = useContext(CarouselContext);
  if (!carousel) throw new Error("Citation carousel parts must be rendered inside InlineCitationCarousel.");
  return carousel;
}

export type InlineCitationCarouselProps = ComponentProps<"div"> & {
  opts?: EmblaOptions;
  plugins?: EmblaPlugins;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: EmblaApi) => void;
};

export function InlineCitationCarousel({
  opts,
  plugins,
  orientation = "horizontal",
  setApi,
  className,
  ...props
}: InlineCitationCarouselProps) {
  const [viewportRef, api] = useEmblaCarousel({ ...opts, axis: orientation === "vertical" ? "y" : "x" }, plugins);
  const [{ selected, count }, setPage] = useState({ selected: 0, count: 0 });

  useEffect(() => {
    if (!api) return;
    setApi?.(api);
    const update = () => setPage({ selected: api.selectedScrollSnap(), count: api.scrollSnapList().length });
    update();
    api.on("select", update).on("reInit", update);
    return () => { api.off("select", update).off("reInit", update); };
  }, [api, setApi]);

  return (
    <CarouselContext.Provider value={{ viewportRef, api, selected, count }}>
      <div role="region" aria-roledescription="carousel" {...props}
        className={cn("inline-citation-carousel", className)} data-orientation={orientation} />
    </CarouselContext.Provider>
  );
}

export type InlineCitationCarouselContentProps = ComponentProps<"div">;
export function InlineCitationCarouselContent({ className, ...props }: InlineCitationCarouselContentProps) {
  const { viewportRef } = useInlineCitationCarousel();
  return <div ref={viewportRef} className="inline-citation-viewport">
    <div className={cn("inline-citation-track", className)} {...props} />
  </div>;
}

export type InlineCitationCarouselItemProps = ComponentProps<"div">;
export function InlineCitationCarouselItem({ className, ...props }: InlineCitationCarouselItemProps) {
  return <div role="group" aria-roledescription="slide" className={cn("inline-citation-slide", className)} {...props} />;
}

export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;
export function InlineCitationCarouselHeader({ className, ...props }: InlineCitationCarouselHeaderProps) {
  return <div className={cn("inline-citation-carousel-header", className)} {...props} />;
}

export type InlineCitationCarouselIndexProps = ComponentProps<"div">;
export function InlineCitationCarouselIndex({ children, ...props }: InlineCitationCarouselIndexProps) {
  const { selected, count } = useInlineCitationCarousel();
  return <div aria-live="polite" {...props}>{children ?? (count ? `${selected + 1}/${count}` : "")}</div>;
}

function CarouselButton({ next, children, disabled, onClick, ...props }: ButtonProps & { next: boolean }) {
  const { api } = useInlineCitationCarousel();
  const canScroll = next ? api?.canScrollNext() : api?.canScrollPrev();
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={next ? "Next source" : "Previous source"}
      {...props}
      disabled={disabled || !canScroll}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (next) api?.scrollNext();
        else api?.scrollPrev();
      }}
    >
      {children ?? (next ? <ChevronRight size={14} aria-hidden="true" /> : <ChevronLeft size={14} aria-hidden="true" />)}
    </Button>
  );
}

export type InlineCitationCarouselPrevProps = ButtonProps;
export function InlineCitationCarouselPrev(props: InlineCitationCarouselPrevProps) {
  return <CarouselButton {...props} next={false} />;
}

export type InlineCitationCarouselNextProps = ButtonProps;
export function InlineCitationCarouselNext(props: InlineCitationCarouselNextProps) {
  return <CarouselButton {...props} next />;
}

export type InlineCitationSourceProps = ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

export function InlineCitationSource({ title, url, description, className, children, ...props }: InlineCitationSourceProps) {
  const href = url ? safeHref(url) : undefined;
  return (
    <div className={cn("inline-citation-source", className)} {...props}>
      <div className="inline-citation-title">{title || (href ? sourceLabel(href) : "Source")}</div>
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {sourceLabel(href)}<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

export type InlineCitationQuoteProps = ComponentProps<"blockquote">;
export function InlineCitationQuote({ className, ...props }: InlineCitationQuoteProps) {
  return <blockquote className={cn("inline-citation-quote", className)} {...props} />;
}
