import { NextResponse } from "next/server";

// In a real app, this would interact with the bKash Tokenized Checkout API
export async function POST(request: Request) {
  try {
    const { jobId, amount, type } = await request.json();

    // Mocking bKash Payment URL generation
    const mockBkashUrl = `/payment/success?jobId=${jobId}&trxId=BKASH${Date.now()}`;

    return NextResponse.json({ paymentUrl: mockBkashUrl });
  } catch (error) {
    console.log("PAYMENT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
