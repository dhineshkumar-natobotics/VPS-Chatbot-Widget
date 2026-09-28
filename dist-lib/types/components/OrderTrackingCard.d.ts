import React from "react";
export interface StepperStep {
    label: string;
    status: "completed" | "active" | "pending";
}
interface OrderTrackingCardProps {
    orderId?: string;
    statusBadge?: string;
    totalAmount?: string;
    steps?: StepperStep[];
}
export declare const OrderTrackingCard: React.FC<OrderTrackingCardProps>;
export {};
