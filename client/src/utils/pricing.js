export const GST_RATE = 0.18;

export const formatPrice = (amount) =>
  Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const calcTotalWithGst = (price) => price * (1 + GST_RATE);
