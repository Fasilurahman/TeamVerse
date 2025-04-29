import { STATUS_CODES } from "http";
import { StripeService } from "../../../infrastructure/services/StripeService";

export class GetReceiptBySessionId {
  private stripeService: StripeService;

  constructor(stripeService: StripeService) {
    this.stripeService = stripeService;
  }

  async execute(sessionId: string) {
    const session = await this.stripeService.retrieveSession(sessionId);

    if (!session.invoice) {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: "Session not found",
      };
    }

    const invoice = await this.stripeService.retrieveInvoice(
      session.invoice as string
    );



    return {
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
      amountPaid: (invoice.amount_paid / 100).toFixed(2),
      currency: invoice.currency.toUpperCase(),
      invoiceUrl: invoice.invoice_pdf,
      invoiceId: invoice.id,
      status: invoice.status,
      lineItems: invoice.lines.data.map((item) => ({
        description: item.description,
        amount: (item.amount / 100).toFixed(2),
        quantity: item.quantity,
      })),
      createdAt: new Date(invoice.created * 1000).toLocaleDateString(),
    };
  }
}
