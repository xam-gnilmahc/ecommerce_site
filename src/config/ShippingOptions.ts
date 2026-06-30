/** A single shipping option with id, label, description, and price */
export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  price: number;
}

/** Available shipping options (free and express) displayed in Google Pay and checkout */
export const shippingOptions: ShippingOption[] = [
  {
    id: 'free',
    label: 'Free shipping',
    description: 'Arrives in 7 to 20 days',
    price: 0,
  },
  {
    id: 'express',
    label: 'Express shipping',
    description: '$3.00 - Arrives in 1 to 3 days',
    price: 3,
  },
];

/** Shipping option param format expected by Google Pay API */
export interface ShippingOptionParam {
  id: string;
  label: string;
  description: string;
}

/** Google Pay shipping option parameters configuration */
export interface ShippingOptionParameters {
  defaultSelectedOptionId: string;
  shippingOptions: ShippingOptionParam[];
}

/** Google Pay formatted shipping option parameters with default selection */
export const shippingOptionParameters: ShippingOptionParameters = {
  defaultSelectedOptionId: 'free',
  shippingOptions: shippingOptions.map((o) => ({
    id: o.id,
    label: o.label,
    description: o.description,
  })),
};
