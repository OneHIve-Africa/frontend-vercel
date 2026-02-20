import Api from "./Api";

interface PaymentDetails {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  hiveType: string;
  investmentTier: string;
  quantity: number;
  personalDetails: string;
  timestamp: string;
}

class PaymentApi extends Api {
  private static paymentApiInstance: PaymentApi;

  private constructor() {
    super();
  }

  public static getInstance(): PaymentApi {
    if (!PaymentApi.paymentApiInstance) {
      PaymentApi.paymentApiInstance = new PaymentApi();
    }
    return PaymentApi.paymentApiInstance;
  }

  async createPayment(paymentDetails: PaymentDetails) {
    return this.post<{ message: string }>("/payments/confirm/", paymentDetails);
  }
}

export default PaymentApi.getInstance();
