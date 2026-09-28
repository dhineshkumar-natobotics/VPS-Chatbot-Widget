import React, { useState } from "react";
import { ThumbsDown, ThumbsUp, Hand, CheckCircle2 } from "lucide-react";

interface FeedbackRatingCardProps {
  onSubmitFeedback?: (rating: string, reasons: string) => void;
  onCancel?: () => void;
}

type RatingType = "Bad" | "Okay" | "Good" | "Amazing";

export const FeedbackRatingCard: React.FC<FeedbackRatingCardProps> = ({
  onSubmitFeedback,
  onCancel,
}) => {
  const [selectedRating, setSelectedRating] = useState<RatingType>("Amazing");
  const [reasons, setReasons] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onSubmitFeedback) {
      onSubmitFeedback(selectedRating, reasons);
    }
  };

  if (isSubmitted) {
    return (
      <div className="feedback-card feedback-submitted">
        <CheckCircle2 size={36} color="#10B981" />
        <h4>Thank you for your feedback!</h4>
        <p>Your response helps us improve the support experience.</p>
      </div>
    );
  }

  return (
    <div className="feedback-card">
      <h3 className="feedback-title">Thanks for the chat, How do you feel ?</h3>

      <div className="rating-grid">
        {/* Bad */}
        <button
          type="button"
          className={`rating-item-btn ${selectedRating === "Bad" ? "rating-item-selected" : ""}`}
          onClick={() => setSelectedRating("Bad")}
        >
          <div className="rating-icon-box">
            <ThumbsDown size={22} />
          </div>
          <span className="rating-label">Bad</span>
        </button>

        {/* Okay */}
        <button
          type="button"
          className={`rating-item-btn ${selectedRating === "Okay" ? "rating-item-selected" : ""}`}
          onClick={() => setSelectedRating("Okay")}
        >
          <div className="rating-icon-box">
            <span style={{ fontSize: "20px", lineHeight: "1" }}>✌️</span>
          </div>
          <span className="rating-label">Okay</span>
        </button>

        {/* Good */}
        <button
          type="button"
          className={`rating-item-btn ${selectedRating === "Good" ? "rating-item-selected" : ""}`}
          onClick={() => setSelectedRating("Good")}
        >
          <div className="rating-icon-box">
            <Hand size={22} />
          </div>
          <span className="rating-label">Good</span>
        </button>

        {/* Amazing */}
        <button
          type="button"
          className={`rating-item-btn ${selectedRating === "Amazing" ? "rating-item-selected" : ""}`}
          onClick={() => setSelectedRating("Amazing")}
        >
          <div className="rating-icon-box">
            <ThumbsUp size={22} />
          </div>
          <span className="rating-label">Amazing</span>
        </button>
      </div>

      <div className="feedback-reasons-section">
        <label className="feedback-reasons-label" htmlFor="rating-reasons">
          What are the main reasons for your rating?
        </label>
        <textarea
          id="rating-reasons"
          className="feedback-textarea"
          rows={3}
          placeholder="Fill the reasons for you rating"
          value={reasons}
          onChange={(e) => setReasons(e.target.value)}
        />
      </div>

      <div className="feedback-actions">
        <button
          type="button"
          className="feedback-btn-cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="feedback-btn-submit"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
