import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
} from "../../components/ai-elements/inline-citation";
import { safeHref } from "../../lib/safeHref";
import type { Source } from "../api/chatbot-types";
import { formatDocTitle, getRouteHint } from "./GroundedSources";

export function ChatInlineCitation({ label, sources }: { label: string; sources: Source[] }) {
  const entries = sources.map((source) => {
    const title = formatDocTitle(source);
    const url = safeHref(source.url || source.source) ?? getRouteHint(source.source)?.path;
    return {
      key: source.chunkId,
      label: url || title,
      content: (
        <>
          <InlineCitationSource title={title} url={url} />
          {source.snippet && <InlineCitationQuote>{source.snippet}</InlineCitationQuote>}
        </>
      ),
    };
  });

  return (
    <InlineCitation>
      <InlineCitationCard>
        <InlineCitationCardTrigger sources={entries.map((entry) => entry.label)} aria-label={"View sources " + label}>
          {label}
        </InlineCitationCardTrigger>
        <InlineCitationCardBody>
          {entries.length === 1 ? entries[0].content : (
            <InlineCitationCarousel aria-label="Sources">
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselIndex />
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselNext />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                {entries.map((entry, index) => (
                  <InlineCitationCarouselItem key={entry.key + "-" + index} aria-label={"Source " + (index + 1)}>
                    {entry.content}
                  </InlineCitationCarouselItem>
                ))}
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          )}
        </InlineCitationCardBody>
      </InlineCitationCard>
    </InlineCitation>
  );
}
