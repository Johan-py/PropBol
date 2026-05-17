// src/types/realEstateTransaction.ts

export type PaymentMethodType =
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "cash";
export type PaymentConcept = "deposit" | "rent" | "purchase" | "maintenance";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";
export type PaymentFrequency = "monthly" | "quarterly" | "biannual";
export type PlanStatus = "active" | "completed" | "cancelled";

export interface PropertyPaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  lastFourDigits?: string;
  isDefault: boolean;
  expiryDate?: string;
  bankName?: string;
  cardHolderName?: string;
}

export interface PropertyPaymentDetails {
  propertyId: string;
  propertyName: string;
  amount: number;
  currency: string;
  concept: PaymentConcept;
  description: string;
  reference?: string;
}

export interface PropertyTransaction {
  id: string;
  paymentDetails: PropertyPaymentDetails;
  paymentMethod: PropertyPaymentMethod;
  status: TransactionStatus;
  transactionDate: Date;
  invoiceNumber: string;
  receiptUrl?: string;
  errorMessage?: string;
}

export interface PropertyInstallmentPlan {
  id: string;
  propertyId: string;
  totalAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  frequency: PaymentFrequency;
  startDate: Date;
  remainingInstallments: number;
  status: PlanStatus;
  nextPaymentDate?: Date;
}

export interface PropertyCheckoutFormData {
  concept: PaymentConcept;
  amount: number;
  paymentType: PaymentMethodType;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface PaymentFilter {
  status: TransactionStatus | "all";
  startDate: string;
  endDate: string;
  concept?: PaymentConcept;
  minAmount?: number;
  maxAmount?: number;
}
