import Razorpay from 'razorpay';

export const getRazorpayInstance = () => {
  const isKeyConfigured =
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_lumina_key_id' &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET !== 'rzp_test_lumina_key_secret';

  if (isKeyConfigured) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  // Sandbox fallback simulator
  return {
    isSandbox: true,
    orders: {
      create: async (options) => {
        return {
          id: `order_dev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000)
        };
      }
    }
  };
};
