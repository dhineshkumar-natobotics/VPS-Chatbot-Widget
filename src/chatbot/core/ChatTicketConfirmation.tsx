import React, { useState } from "react";
import { useChatbot } from "../hooks/useChatbot";

export const ChatTicketConfirmation: React.FC = () => {
  const { pendingTicket, ticketBusy, userContext, confirmTicket, cancelTicket } =
    useChatbot();
  const needsIdentity = !userContext.customerId && !userContext.email;
  const [identity, setIdentity] = useState("");

  if (!pendingTicket) return null;

  return (
    <div
      className="mx-4 mb-3 rounded-xl border border-border bg-card p-4 shadow-sm"
      role="region"
      aria-label="Create support ticket"
    >
      <h3 className="text-[13.5px] font-bold text-foreground">
        Create support ticket?
      </h3>
      <p className="mt-1.5 text-[12.5px] leading-5 text-muted-foreground">
        I can open a support request for you. Nothing is created until you confirm.
      </p>
      <p className="mt-2 rounded-md bg-muted px-2.5 py-2 text-[12.5px] text-foreground">
        {pendingTicket.description}
      </p>
      {needsIdentity && (
        <label className="mt-3 block text-[12px] font-semibold text-foreground">
          Customer ID or email
          <input
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
            className="mt-1 w-full rounded-md border border-border px-2.5 py-2 text-[13px] font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="CUST-1001 or you@company.com"
            autoComplete="email"
          />
        </label>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={cancelTicket}
          disabled={ticketBusy}
          className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void confirmTicket(identity)}
          disabled={ticketBusy || (needsIdentity && !identity.trim())}
          className="rounded-lg bg-action px-3.5 py-1.5 text-[12.5px] font-semibold text-action-foreground hover:bg-[var(--action-hover)] disabled:opacity-40"
        >
          {ticketBusy ? "Creating…" : "Create ticket"}
        </button>
      </div>
    </div>
  );
};
