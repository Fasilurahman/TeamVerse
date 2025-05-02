import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  ArrowLeft,
  Download,
  Share2,
  Shield,
  Clock,
  CreditCard,
  Trophy,
} from "lucide-react";
import { fetchUserReceipt } from "../services/SubscriptionService";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Receipt {
  amount: number;
  transactionId: string;
  createdAt: string;
  amountPaid: number;
  status: 'paid' | 'pending' | 'failed';
  customerName: string;
  customerEmail: string;
  invoiceId?: string;
  invoiceUrl?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
}

const PaymentSuccess: React.FC = () => {
  const [showContent, setShowContent] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchParams] = useSearchParams();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    setShowContent(true);
    setTimeout(() => setShowSuccessMessage(true), 1000);
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchUserReceipt(sessionId)
        .then((data) => setReceipt(data))
        .catch(console.error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Payment Receipt',
        text: `Check out my payment details:\nAmount: $${receipt?.amountPaid}\nInvoice ID: ${receipt?.invoiceId}\nDate: ${receipt?.createdAt}`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers without Share API
        await navigator.clipboard.writeText(window.location.href);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      setToastMessage('Sharing failed. Please try again.');
      setShowToast(true);
    }
  };

  const handleDownload = () => {
    if (receipt?.invoiceUrl) {
      const link = document.createElement('a');
      link.href = receipt.invoiceUrl;
      link.setAttribute('download', `invoice_${receipt.invoiceId || 'receipt'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const features = [
    { icon: Shield, text: "Secure Payment", color: "text-blue-500" },
    { icon: Clock, text: "Instant Processing", color: "text-purple-500" },
    { icon: CreditCard, text: "Payment Protected", color: "text-pink-500" },
    { icon: Trophy, text: "Verified Transaction", color: "text-yellow-500" },
  ];

  return (
    <div className="h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      {/* Success Message Popup */}
      <div className={`fixed top-4 right-4 bg-white/90 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg transform transition-all duration-500 flex items-center gap-2 ${
        showSuccessMessage ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
      }`}>
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-sm font-medium text-gray-800">
          Payment Verified Successfully!
        </span>
      </div>

      {/* Success Card */}
      <div className={`max-w-md w-full transform ${
        showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } transition-all duration-1000 ease-out`}>
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Success Icon Section */}
          <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 p-6 flex justify-center relative">
            <div className={`rounded-full bg-white p-3 shadow-xl transform ${
              showContent ? "scale-100 rotate-0" : "scale-50 rotate-45"
            } transition-all duration-700 delay-300 relative group hover:rotate-180`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <CheckCircle className="w-12 h-12 text-green-500 relative" strokeWidth={2} />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-5">
            <div className={`transform ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-700 delay-500`}>
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text mb-2">
                Payment Successful!
              </h1>
              <p className="text-center text-gray-600 text-sm">
                Your transaction has been processed and confirmed.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/50 backdrop-blur border border-white/20 transform hover:scale-105 transition-all duration-300 ${
                    showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}>
                  <feature.icon className={`w-5 h-5 ${feature.color} flex-shrink-0`} />
                  <span className="text-sm font-medium text-gray-700">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Transaction Details */}
            <div className={`bg-white/50 backdrop-blur rounded-xl px-5 py-4 border border-white/20 transform ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-700 delay-700 hover:shadow-lg hover:bg-white/60 group`}>
              <div className="space-y-4">
                {/* Amount Paid */}
                <div className="flex justify-between items-center group/amount">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text group-hover/amount:scale-110 transform transition-transform">
                    ${receipt?.amountPaid ?? "..."}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent group-hover:via-emerald-400 transition-colors" />

                {/* Invoice ID */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Invoice ID</span>
                  <span className="font-mono text-sm text-gray-800 bg-gray-100 px-3 py-1 rounded-full cursor-copy hover:bg-gray-200 transition-colors">
                    {receipt?.invoiceId ?? "..."}
                  </span>
                </div>

                {/* Transaction Status */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    receipt?.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {receipt?.status ?? "..."}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent group-hover:via-emerald-400 transition-colors" />

                {/* Date */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-800">
                    {receipt ? new Date(receipt.createdAt).toLocaleDateString() : "..."}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-sm text-gray-600">Customer</span>
                  <span className="text-gray-800 font-semibold">
                    {receipt?.customerName}
                  </span>
                  <span className="text-sm text-gray-700">
                    {receipt?.customerEmail}
                  </span>
                </div>

                {/* Line Items */}
                {receipt?.lineItems && receipt.lineItems.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <h3 className="text-gray-700 font-semibold">Line Items</h3>
                    <ul className="space-y-1 text-sm">
                      {receipt.lineItems.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">{item.description}</span>
                          <span className="text-gray-800 font-medium">
                            {item.quantity} × ${item.amount}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`space-y-3 transform ${
              showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-700 delay-900`}>
              <button
                onClick={handleDownload}
                disabled={!receipt?.invoiceUrl}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                <Download className="w-5 h-5" />
                Download Receipt
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/home')}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transform group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <button onClick={handleShare} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transform group">
                  <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;