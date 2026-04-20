export const shippingOptions = [
  {
    id: "free",
    label: "Free shipping",
    description: "Arrives in 5 to 7 days",
    price: 0,
  },
  {
    id: "express",
    label: "Express shipping",
    description: "$5.00 - Arrives in 1 to 3 days",
    price: 5,
  },
];

/** Default selected shipping option + available options */
export const shippingOptionParameters = {
  defaultSelectedOptionId: "free",
  shippingOptions: shippingOptions.map((o) => ({
    id: o.id,
    label: o.label,
    description: o.description,
  })),
};