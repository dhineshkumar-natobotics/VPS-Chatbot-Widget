import React from "react";
interface FeedbackRatingCardProps {
    onSubmitFeedback?: (rating: string, reasons: string) => void;
    onCancel?: () => void;
}
export declare const FeedbackRatingCard: React.FC<FeedbackRatingCardProps>;
export {};
