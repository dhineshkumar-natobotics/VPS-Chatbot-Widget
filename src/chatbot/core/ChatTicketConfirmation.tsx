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
      className="ticket-card"
      role="region"
      aria-label="Create support ticket"
    >
      <h3 className="ticket-card-title">
        Create support ticket?
      </h3>
      <p className="ticket-card-desc">
        I can open a support request for you. Nothing is created until you confirm.
      </p>
      <p className="ticket-card-body">
        {pendingTicket.description}
      </p>
      {needsIdentity && (
        <label className="ticket-id-label">
          Customer ID or email
          <input
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
            className="ticket-id-input"
            placeholder="CUST-1001 or you@company.com"
            autoComplete="email"
          />
        </label>
      )}
      <div className="ticket-actions">
        <button
          type="button"
          onClick={cancelTicket}
          disabled={ticketBusy}
          className="ticket-cancel-btn"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void confirmTicket(identity)}
          disabled={ticketBusy || (needsIdentity && !identity.trim())}
          className="ticket-confirm-btn"
        >
          {ticketBusy ? "Creating…" : "Create ticket"}
        </button>
      </div>
    </div>
  );
};
