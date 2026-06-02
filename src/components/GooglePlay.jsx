import { paymentRequest } from '../config/GooglePay';
import { shippingOptions } from '../config/ShippingOptions';

/** Calculate and return the total price */
function calculateTotalPrice(displayItems) {
  return displayItems.reduce((total, item) => total + Number(item.price), 0);
}

/** Build the Google Pay payment request */
function buildPaymentRequest(displayItems) {
  return {
    ...paymentRequest,
    transactionInfo: {
      ...paymentRequest.transactionInfo,
      displayItems: [...displayItems],
      totalPrice: calculateTotalPrice(displayItems).toFixed(2),
    },
  };
}

/** Get updated payment data when user changes shipping / options */
function getUpdatedPaymentData(paymentRequest, paymentData) {
  // Check if a shipping option was chosen
  if (paymentData.shippingOptionData?.id) {
    const shippingOption = shippingOptions.find(
      (option) => option.id === paymentData.shippingOptionData.id
    );

    if (shippingOption) {
      const displayItems = [
        ...(paymentRequest.transactionInfo.displayItems || []),
        {
          label: shippingOption.label,
          price: shippingOption.price.toFixed(2),
          type: 'SHIPPING_OPTION',
        },
      ];

      return {
        newTransactionInfo: {
          ...paymentRequest.transactionInfo,
          totalPrice: calculateTotalPrice(displayItems).toFixed(2),
          displayItems,
        },
      };
    }
  }

  return {};
}

export { buildPaymentRequest, getUpdatedPaymentData };
