import React, { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";

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

export const OrderTrackingCard: React.FC<OrderTrackingCardProps> = ({
  orderId = "#SO-567",
  statusBadge = "Paid",
  totalAmount = "$256.00",
  steps = [
    { label: "Quoted", status: "completed" },
    { label: "Packed", status: "active" },
    { label: "Shipped", status: "pending" },
    { label: "Delivered", status: "pending" },
  ],
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="tracking-card">
      <div className="tracking-header">
        <div className="tracking-title-row">
          <span className="tracking-order-title">
            Order <strong>{orderId}</strong>
          </span>
          <span className="tracking-paid-badge">{statusBadge}</span>
        </div>
        <button
          className="tracking-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand tracker" : "Collapse tracker"}
          aria-label="Toggle tracker"
        >
          {isCollapsed ? <Plus size={14} /> : <Minus size={14} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="tracking-body">
          <div className="tracking-total">
            Total <strong>{totalAmount}</strong>
          </div>

          <div className="stepper-container">
            {steps.map((step, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === steps.length - 1;

              return (
                <div key={idx} className="stepper-item">
                  <div className="stepper-indicator-wrapper">
                    {/* Left connector line */}
                    {!isFirst && (
                      <div
                        className={`stepper-line ${
                          step.status === "completed" || step.status === "active"
                            ? "stepper-line-active"
                            : "stepper-line-dotted"
                        }`}
                      />
                    )}

                    {/* Step Node */}
                    <div className={`stepper-node stepper-node-${step.status}`}>
                      {step.status === "completed" ? (
                        <Check size={11} strokeWidth={3} />
                      ) : (
                        <span className="stepper-dot" />
                      )}
                    </div>

                    {/* Right connector line */}
                    {!isLast && (
                      <div
                        className={`stepper-line ${
                          step.status === "completed"
                            ? "stepper-line-active"
                            : "stepper-line-dotted"
                        }`}
                      />
                    )}
                  </div>
                  <span className={`stepper-label stepper-label-${step.status}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
