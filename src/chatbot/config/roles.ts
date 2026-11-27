import type { ChatAccessContext, ChatServiceArea } from "../api/chatbot-types";

interface PortalRole {
  name: string;
  client: NonNullable<ChatAccessContext["client"]>;
  topics: string;
  questions: readonly string[];
  services: readonly ChatServiceArea[];
  serviceQuestions?: Partial<Record<ChatServiceArea, readonly string[]>>;
  webQuestions?: readonly string[];
  webServiceQuestions?: Partial<Record<ChatServiceArea, readonly string[]>>;
}

const BOTH_SERVICES = ["vessel", "tot"] as const;

export const CUSTOMER_PORTAL_ROLES = {
  1: {
    name: "CC Report",
    client: "web",
    services: BOTH_SERVICES,
    topics: "finding, filtering, and downloading reports",
    questions: ["How do I download a fuel report?", "How do I filter lubricant reports?", "How do I find a transformer oil report?"],
    serviceQuestions: {
      vessel: ["How do I download a fuel report?", "How do I filter lubricant reports?"],
      tot: ["How do I find a transformer oil report?", "How do I download a transformer oil report as a PDF?"],
    },
  },
  2: {
    name: "Client Admin",
    client: "admin",
    services: BOTH_SERVICES,
    topics: "client access, Vessel and TOT workflows, and VPS support",
    questions: ["How do I add a client user?", "How do I find reports for a vessel or transformer?", "Why is a portal menu missing for a client user?"],
  },
  6: {
    name: "Fleet Manager",
    client: "web",
    services: ["vessel"],
    topics: "vessels, marine samples, reports, and fleet trends",
    questions: ["How do I find reports for a vessel?", "Where can I find a vessel's sample status?", "How do I review fleet fuel trends?"],
  },
  7: {
    name: "High Level Management",
    client: "web",
    services: BOTH_SERVICES,
    topics: "management dashboards and trend comparisons",
    questions: ["How do I compare fuel trends across vessels?", "How do I review transformer oil trends?", "Where is the CII Dashboard?"],
  },
  9: {
    name: "Sampler",
    client: "mobile",
    services: BOTH_SERVICES,
    topics: "sample pre-registration, barcode scanning, and labels in the mobile app",
    questions: ["How do I pre-register a vessel sample in the mobile app?", "How do I scan a sample label?", "How do I pre-register a transformer sample in the mobile app?"],
    serviceQuestions: {
      vessel: ["How do I pre-register a vessel sample in the mobile app?", "How do I scan a vessel sample label?"],
      tot: ["How do I pre-register a transformer sample in the mobile app?", "How do I scan a transformer sample label?"],
    },
    webQuestions: ["How do I pre-register a vessel sample in the portal?", "How do I pre-register a transformer sample in the portal?"],
    webServiceQuestions: {
      vessel: ["How do I pre-register a vessel sample in the portal?", "Where can I download my fuel report?"],
      tot: ["How do I pre-register a transformer sample in the portal?", "Where can I download a transformer oil report?"],
    },
  },
  10: {
    name: "VPS Admin",
    client: "admin",
    services: BOTH_SERVICES,
    topics: "Vessel and TOT workflows, portal administration, and VPS support",
    questions: ["How do I review a portal registration request?", "Where do I find vessel reports?", "How do I view transformer oil test trends?"],
  },
  11: {
    name: "Transoil",
    client: "web",
    services: ["tot"],
    topics: "transformer assets, oil reports, and trends",
    questions: ["How do I find my transformer equipment?", "Where can I download a transformer oil report?", "How do I review transformer oil trends?"],
  },
  12: {
    name: "Bunker Master Only",
    client: "mobile",
    services: ["vessel"],
    topics: "Bunker Master access, calculators, and Fuel Change-Over",
    questions: ["How do I request Bunker Master access?", "Where can I find the Bunker Master calculators?", "How do I download the Fuel Change-Over workbook?"],
  },
  13: {
    name: "Fleet Manager Transoil",
    client: "web",
    services: ["tot"],
    topics: "transformer equipment, reports, and fleet trends",
    questions: ["How do I compare transformer oil trends for equipment?", "How do I filter transformer oil reports by site?", "How do I pre-register a transformer sample?"],
  },
} as const satisfies Record<number, PortalRole>;

export type CustomerPortalRoleId = keyof typeof CUSTOMER_PORTAL_ROLES;

export function findPortalRole(roleId?: number): PortalRole | undefined {
  return CUSTOMER_PORTAL_ROLES[roleId as CustomerPortalRoleId];
}
