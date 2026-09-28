const TICKET_INTENT =
  /\b(create (a )?support ticket|open (a )?ticket|raise (a )?ticket|submit (a )?ticket|create (a )?ticket|contact support|speak to support)\b/i;

export function detectTicketIntent(text: string): boolean {
  return TICKET_INTENT.test(text.trim());
}

export function ticketSubjectFromText(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 80) return cleaned;
  return `${cleaned.slice(0, 77)}...`;
}
