import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Home } from 'lucide-react';

const PaymentResult: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const status = params.get('status');
  const paymentNumber = params.get('payment_number');
  const refId = params.get('ref_id');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        {isSuccess ? (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-extrabold text-gray-900">پرداخت با موفقیت انجام شد</h1>
            <p className="text-gray-600 text-sm">
              اطلاعات پرداخت شما ثبت شده است. در صورت نیاز، این رسید را نزد خود نگه دارید.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-right text-sm space-y-1">
              {paymentNumber && (
                <p>
                  <span className="font-bold text-gray-800">شماره پرداخت داخلی:</span>{' '}
                  <span className="font-mono text-gray-700">{paymentNumber}</span>
                </p>
              )}
              {refId && (
                <p>
                  <span className="font-bold text-gray-800">کد رهگیری زرین‌پال:</span>{' '}
                  <span className="font-mono text-gray-700">{refId}</span>
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto" />
            <h1 className="text-2xl font-extrabold text-gray-900">پرداخت ناموفق بود</h1>
            <p className="text-gray-600 text-sm">
              متأسفانه پرداخت شما تکمیل نشد یا توسط شما لغو شد. در صورت کسر وجه، مبلغ به صورت خودکار توسط بانک بازگشت داده می‌شود.
            </p>
            {paymentNumber && (
              <div className="bg-gray-50 rounded-xl p-4 text-right text-sm">
                <p>
                  <span className="font-bold text-gray-800">شناسه پرداخت داخلی:</span>{' '}
                  <span className="font-mono text-gray-700">{paymentNumber}</span>
                </p>
              </div>
            )}
          </>
        )}

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            <Home className="w-4 h-4 ml-2" />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;

