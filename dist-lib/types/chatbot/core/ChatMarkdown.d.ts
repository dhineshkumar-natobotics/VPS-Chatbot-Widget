import React from "react";
import type { Source } from "../api/chatbot-types";
export { safeHref } from "../../lib/safeHref";
export declare const ChatMarkdown: React.NamedExoticComponent<{
    text: string;
    streaming?: boolean;
    sources?: Source[];
}>;
