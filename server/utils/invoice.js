export const buildInvoice = (order) => {
  const created = order.invoiceGeneratedAt || order.updatedAt || order.createdAt || new Date();
  const date = new Date(created);
  return {
    invoiceNumber: order.invoiceNumber || '',
    createdAt: date,
    tokenNumber: order.tokenNumber,
    customer: {
      name: order.userId?.name || '',
      email: order.userId?.email || '',
    },
    items: (order.items || []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      lineTotal: i.price * i.quantity,
    })),
    total: order.totalPrice,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    instructions: order.instructions || '',
    status: order.status,
  };
};

