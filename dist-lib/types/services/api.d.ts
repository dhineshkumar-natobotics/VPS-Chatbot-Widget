import { ChatApiResponse, Message } from "../types/chat";
export declare class ChatService {
    static setBaseUrl(url: string): void;
    static getBaseUrl(): string;
    static createSession(): Promise<string>;
    static sendMessage(sessionId: string, message: string): Promise<ChatApiResponse>;
    static getHistory(sessionId: string): Promise<Message[]>;
    static closeSession(sessionId: string): Promise<void>;
    static checkHealth(): Promise<boolean>;
    static getCustomers(): Promise<any[]>;
    static getTickets(): Promise<any[]>;
}
