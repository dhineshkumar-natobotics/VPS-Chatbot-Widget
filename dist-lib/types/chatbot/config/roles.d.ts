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
export declare const CUSTOMER_PORTAL_ROLES: {
    readonly 1: {
        readonly name: "CC Report";
        readonly client: "web";
        readonly services: readonly ["vessel", "tot"];
        readonly topics: "finding, filtering, and downloading reports";
        readonly questions: readonly ["How do I download a fuel report?", "How do I filter lubricant reports?", "How do I find a transformer oil report?"];
        readonly serviceQuestions: {
            readonly vessel: readonly ["How do I download a fuel report?", "How do I filter lubricant reports?"];
            readonly tot: readonly ["How do I find a transformer oil report?", "How do I download a transformer oil report as a PDF?"];
        };
    };
    readonly 2: {
        readonly name: "Client Admin";
        readonly client: "admin";
        readonly services: readonly ["vessel", "tot"];
        readonly topics: "client access, Vessel and TOT workflows, and VPS support";
        readonly questions: readonly ["How do I add a client user?", "How do I find reports for a vessel or transformer?", "Why is a portal menu missing for a client user?"];
    };
    readonly 6: {
        readonly name: "Fleet Manager";
        readonly client: "web";
        readonly services: readonly ["vessel"];
        readonly topics: "vessels, marine samples, reports, and fleet trends";
        readonly questions: readonly ["How do I find reports for a vessel?", "Where can I find a vessel's sample status?", "How do I review fleet fuel trends?"];
    };
    readonly 7: {
        readonly name: "High Level Management";
        readonly client: "web";
        readonly services: readonly ["vessel", "tot"];
        readonly topics: "management dashboards and trend comparisons";
        readonly questions: readonly ["How do I compare fuel trends across vessels?", "How do I review transformer oil trends?", "Where is the CII Dashboard?"];
    };
    readonly 9: {
        readonly name: "Sampler";
        readonly client: "mobile";
        readonly services: readonly ["vessel", "tot"];
        readonly topics: "sample pre-registration, barcode scanning, and labels in the mobile app";
        readonly questions: readonly ["How do I pre-register a vessel sample in the mobile app?", "How do I scan a sample label?", "How do I pre-register a transformer sample in the mobile app?"];
        readonly serviceQuestions: {
            readonly vessel: readonly ["How do I pre-register a vessel sample in the mobile app?", "How do I scan a vessel sample label?"];
            readonly tot: readonly ["How do I pre-register a transformer sample in the mobile app?", "How do I scan a transformer sample label?"];
        };
        readonly webQuestions: readonly ["How do I pre-register a vessel sample in the portal?", "How do I pre-register a transformer sample in the portal?"];
        readonly webServiceQuestions: {
            readonly vessel: readonly ["How do I pre-register a vessel sample in the portal?", "Where can I download my fuel report?"];
            readonly tot: readonly ["How do I pre-register a transformer sample in the portal?", "Where can I download a transformer oil report?"];
        };
    };
    readonly 10: {
        readonly name: "VPS Admin";
        readonly client: "admin";
        readonly services: readonly ["vessel", "tot"];
        readonly topics: "Vessel and TOT workflows, portal administration, and VPS support";
        readonly questions: readonly ["How do I review a portal registration request?", "Where do I find vessel reports?", "How do I view transformer oil test trends?"];
    };
    readonly 11: {
        readonly name: "Transoil";
        readonly client: "web";
        readonly services: readonly ["tot"];
        readonly topics: "transformer assets, oil reports, and trends";
        readonly questions: readonly ["How do I find my transformer equipment?", "Where can I download a transformer oil report?", "How do I review transformer oil trends?"];
    };
    readonly 12: {
        readonly name: "Bunker Master Only";
        readonly client: "mobile";
        readonly services: readonly ["vessel"];
        readonly topics: "Bunker Master access, calculators, and Fuel Change-Over";
        readonly questions: readonly ["How do I request Bunker Master access?", "Where can I find the Bunker Master calculators?", "How do I download the Fuel Change-Over workbook?"];
    };
    readonly 13: {
        readonly name: "Fleet Manager Transoil";
        readonly client: "web";
        readonly services: readonly ["tot"];
        readonly topics: "transformer equipment, reports, and fleet trends";
        readonly questions: readonly ["How do I compare transformer oil trends for equipment?", "How do I filter transformer oil reports by site?", "How do I pre-register a transformer sample?"];
    };
};
export type CustomerPortalRoleId = keyof typeof CUSTOMER_PORTAL_ROLES;
export declare function findPortalRole(roleId?: number): PortalRole | undefined;
export {};
