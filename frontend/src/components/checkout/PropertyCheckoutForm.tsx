import React, { useState } from "react";
import {
  PropertyPaymentDetails,
  PropertyPaymentMethod,
} from "../../types/realEstateTransaction";

interface PropertyCheckoutFormProps {
  propertyData: {
    id: string;
    name: string;
    price: number;
  };
  onProcessCheckout: (
    paymentDetails: PropertyPaymentDetails,
    paymentMethod: PropertyPaymentMethod,
  ) => Promise<void>;
}

export const PropertyCheckoutForm: React.FC<PropertyCheckoutFormProps> = ({
  propertyData,
  onProcessCheckout,
}) => {
  const [selectedConcept, setSelectedConcept] =
    useState<PropertyPaymentDetails["concept"]>("deposit");
  const [totalAmount, setTotalAmount] = useState<number>(propertyData.price);
  const [paymentType, setPaymentType] =
    useState<PropertyPaymentMethod["type"]>("credit_card");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setCheckoutError(null);

    try {
      const paymentDetails: PropertyPaymentDetails = {
        propertyId: propertyData.id,
        propertyName: propertyData.name,
        amount: totalAmount,
        currency: "USD",
        concept: selectedConcept,
        description: `Payment for ${selectedConcept} - ${propertyData.name}`,
      };

      const paymentMethod: PropertyPaymentMethod = {
        id: `prop_pm_${Date.now()}`,
        type: paymentType,
        name:
          paymentType === "credit_card"
            ? "Credit Card"
            : paymentType === "debit_card"
              ? "Debit Card"
              : paymentType === "bank_transfer"
                ? "Bank Transfer"
                : "Cash",
        isDefault: false,
      };

      await onProcessCheckout(paymentDetails, paymentMethod);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <form onSubmit={handleCheckoutSubmit} className="property-checkout-form">
      <h2>Complete Property Payment</h2>

      <div className="form-group">
        <label>Property</label>
        <input type="text" value={propertyData.name} disabled />
      </div>

      <div className="form-group">
        <label>Payment Concept</label>
        <select
          value={selectedConcept}
          onChange={(e) =>
            setSelectedConcept(
              e.target.value as PropertyPaymentDetails["concept"],
            )
          }
        >
          <option value="deposit">Security Deposit</option>
          <option value="rent">Monthly Rent</option>
          <option value="purchase">Property Purchase</option>
          <option value="maintenance">Maintenance Fee</option>
        </select>
      </div>

      <div className="form-group">
        <label>Amount (USD)</label>
        <input
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(Number(e.target.value))}
          min={0}
          step={0.01}
          required
        />
      </div>

      <div className="form-group">
        <label>Payment Method</label>
        <div className="property-payment-methods">
          {(
            ["credit_card", "debit_card", "bank_transfer", "cash"] as const
          ).map((method) => (
            <label key={method} className="property-payment-option">
              <input
                type="radio"
                name="propertyPaymentType"
                value={method}
                checked={paymentType === method}
                onChange={(e) =>
                  setPaymentType(
                    e.target.value as PropertyPaymentMethod["type"],
                  )
                }
              />
              <span className="method-label">
                {method === "credit_card"
                  ? "Credit Card"
                  : method === "debit_card"
                    ? "Debit Card"
                    : method === "bank_transfer"
                      ? "Bank Transfer"
                      : "Cash"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {checkoutError && (
        <div className="checkout-error-message">{checkoutError}</div>
      )}

      <button
        type="submit"
        disabled={isProcessingPayment || totalAmount <= 0}
        className="checkout-submit-button"
      >
        {isProcessingPayment
          ? "Processing Payment..."
          : `Pay $${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
};
