import { paymentRequest, GooglePayPaymentRequest } from '../../config/GooglePay.ts';
import { shippingOptions } from '../../config/ShippingOptions.ts';

export interface DisplayItem {
  label: string;
  price: string;
  type: string;
}

export interface TransactionInfo {
  displayItems?: DisplayItem[];
  totalPrice?: string;
  totalPriceStatus?: string;
  totalPriceLabel?: string;
  currencyCode?: string;
  countryCode?: string;
}

export interface ShippingOptionData {
  id: string;
  label?: string;
  description?: string;
}

export interface PaymentData {
  shippingOptionData?: ShippingOptionData;
  shippingAddress?: {
    address1?: string;
    address2?: string;
    countryCode?: string;
    administrativeArea?: string;
    locality?: string;
    postalCode?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UpdatedTransactionInfo {
  newTransactionInfo: TransactionInfo;
}

function calculateTotalPrice(displayItems: DisplayItem[]): number {
  return displayItems.reduce((total, item) => total + Number(item.price), 0);
}

function buildPaymentRequest(displayItems: DisplayItem[]): GooglePayPaymentRequest {
  return {
    ...paymentRequest,
    transactionInfo: {
      ...paymentRequest.transactionInfo,
      displayItems: [...displayItems],
      totalPrice: calculateTotalPrice(displayItems).toFixed(2),
    },
  };
}

function getUpdatedPaymentData(
  paymentReq: GooglePayPaymentRequest,
  paymentData: PaymentData
): UpdatedTransactionInfo | Record<string, never> {
  if (paymentData.shippingOptionData?.id) {
    const shippingOption = shippingOptions.find(
      (option) => option.id === paymentData.shippingOptionData!.id
    );

    if (shippingOption) {
      const displayItems: DisplayItem[] = [
        ...(paymentReq.transactionInfo.displayItems || []),
        {
          label: shippingOption.label,
          price: shippingOption.price.toFixed(2),
          type: 'SHIPPING_OPTION',
        },
      ];

      return {
        newTransactionInfo: {
          ...paymentReq.transactionInfo,
          totalPrice: calculateTotalPrice(displayItems).toFixed(2),
          displayItems,
        },
      };
    }
  }

  return {};
}

export { buildPaymentRequest, getUpdatedPaymentData };
