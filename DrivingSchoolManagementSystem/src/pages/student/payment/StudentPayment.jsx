import React, { useState, useEffect } from "react";
import StudentSidebar from "../../../components/student/StudentSidebar";
import "./studentPayment.css";

export default function StudentPayment() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(stored);
  const userId = user.user_id || user.userId;

  useEffect(() => {
    if (userId) fetchPayments();
  }, [userId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:3000/student/payments/${userId}`);
      const data = await res.json();
      if (data.ok) setPayments(data.payments);
    } catch (err) {
      console.error("Payment sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:3000/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: 'SYSTEM_ADMIN',
          sender_id: userId,
          message: `Student ${user.first_name} initiated a payment of Rs. ${formData.amount} via ${selectedPaymentMethod.toUpperCase()}.`,
          subject: 'Payment Implementation Notice',
          priority: 'low',
          category: 'payment'
        })
      });
      
      alert(`Transaction of Rs. ${formData.amount} processed successfully via ${selectedPaymentMethod === 'card' ? 'Visa/Mastercard' : 'Bank Transfer'}. Records synced.`);
      setFormData({ amount: "", cardNumber: "", cardholderName: "", expiryDate: "", cvv: "" });
      fetchPayments();
    } catch (err) {
      alert("Synchronization failed. Check internet connection.");
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const paymentHistory = payments.filter(p => p.status !== 'Pending');

  return (
    <div className="stu-payment__main" id="id_stu_payment_main">
      <StudentSidebar active="Payment" />
      
      <div className="stu-payment__container">
        <header className="stu-payment__header">
          <h1 className="stu-paymentTitle">Trainee Finance Hub</h1>
          <p className="stu-paymentSubtitle">Manage your training packages and session invoices</p>
        </header>

        <div className="stu-paymentContainer">
          {/* Left Column - Payment Form */}
          <div className="stu-paymentFormSection">
            <div className="stu-paymentFormCard glass-panel">
              <h2 className="stu-formCardTitle">Secure Payment Portal</h2>
              <p className="stu-formCardSubtitle">
                Select an instrument to complete your transaction
              </p>

              {/* Payment Method Selector */}
              <div className="stu-paymentMethodsGroup">
                {/* Credit/Debit Card */}
                <div
                  className={`stu-paymentMethodItem ${
                    selectedPaymentMethod === "card" ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentMethodChange("card")}
                >
                  <div className="stu-methodLeft">
                    <span className="stu-methodIcon">💳</span>
                  </div>
                  <div className="stu-methodContent">
                    <div className="stu-methodTitle">Credit / Debit Card</div>
                    <div className="stu-methodSubtext">
                      Instant verification via Secure Channel
                    </div>
                  </div>
                  <div className="stu-methodRight">
                    <span
                      className={`stu-methodCheckmark ${
                        selectedPaymentMethod === "card" ? "visible" : ""
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div
                  className={`stu-paymentMethodItem ${
                    selectedPaymentMethod === "bank" ? "selected" : ""
                  }`}
                  onClick={() => handlePaymentMethodChange("bank")}
                >
                  <div className="stu-methodLeft">
                    <span className="stu-methodIcon">🏦</span>
                  </div>
                  <div className="stu-methodContent">
                    <div className="stu-methodTitle">Bank Transfer</div>
                    <div className="stu-methodSubtext">
                      Direct deposit (Requires 24h verification)
                    </div>
                  </div>
                  <div className="stu-methodRight">
                    <span
                      className={`stu-methodCheckmark ${
                        selectedPaymentMethod === "bank" ? "visible" : ""
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              {selectedPaymentMethod === "card" && (
                <form onSubmit={handleSubmit} className="stu-paymentForm">
                  <div className="stu-formGroup">
                    <label htmlFor="amount" className="stu-formLabel">Amount (LKR)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleFormChange}
                      className="stu-formInput"
                      required
                    />
                  </div>

                  <div className="stu-formGroup">
                    <label htmlFor="cardNumber" className="stu-formLabel">Card Identity</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={formData.cardNumber}
                      onChange={handleFormChange}
                      className="stu-formInput"
                      required
                    />
                  </div>

                  <div className="stu-formGroup">
                    <label htmlFor="cardholderName" className="stu-formLabel">Holder Name</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      placeholder="As printed on card"
                      value={formData.cardholderName}
                      onChange={handleFormChange}
                      className="stu-formInput"
                      required
                    />
                  </div>

                  <div className="stu-formRow">
                    <div className="stu-formGroup">
                      <label htmlFor="expiryDate" className="stu-formLabel">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="12/26"
                        value={formData.expiryDate}
                        onChange={handleFormChange}
                        className="stu-formInput"
                        required
                      />
                    </div>
                    <div className="stu-formGroup">
                      <label htmlFor="cvv" className="stu-formLabel">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        placeholder="•••"
                        value={formData.cvv}
                        onChange={handleFormChange}
                        className="stu-formInput"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="stu-payNowBtn">Authorize Transaction</button>
                </form>
              )}

              {selectedPaymentMethod === "bank" && (
                <div className="stu-bankTransferInfo">
                  <p>Electronic Funds Transfer Details:</p>
                  <div className="stu-bankDetails">
                    <p><strong>Institution:</strong> Thisara Financial Hub (Bank of Ceylon)</p>
                    <p><strong>Account:</strong> 8892110455</p>
                    <p><strong>Branch:</strong> Colombo Main</p>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Include Student ID in reference</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment Info */}
          <div className="stu-paymentInfoSection">
            <div className="stu-paymentInfoCard glass-panel">
              <h3 className="stu-infoCardTitle">Outstanding Invoices</h3>
              <div className="stu-paymentItemsList">
                {pendingPayments.length > 0 ? pendingPayments.map((payment, index) => (
                  <div key={payment.payment_id} className="stu-paymentItem">
                    <div className="stu-paymentItemLeft">
                      <div className="stu-paymentItemTitle">Session/Package Due</div>
                      <div className="stu-paymentItemDate">Billed: {new Date(payment.payment_date).toLocaleDateString()}</div>
                    </div>
                    <div className="stu-paymentItemRight">
                      <div className="stu-paymentItemAmount">
                        LKR <span className="stu-amountValue">{parseFloat(payment.amount).toLocaleString()}</span>
                      </div>
                    </div>
                    {index < pendingPayments.length - 1 && <div className="stu-paymentItemDivider"></div>}
                  </div>
                )) : (
                  <p className="empty-text">No pending payments found.</p>
                )}
              </div>
            </div>

            <div className="stu-paymentInfoCard glass-panel">
              <h3 className="stu-infoCardTitle">Transaction Ledger</h3>
              <div className="stu-paymentItemsList">
                {paymentHistory.length > 0 ? paymentHistory.map((history, index) => (
                  <div key={history.payment_id} className="stu-paymentItem">
                    <div className="stu-paymentItemLeft">
                      <div className="stu-paymentItemTitle">Educational Fee</div>
                      <div className="stu-paymentItemDate">Success: {new Date(history.payment_date).toLocaleDateString()}</div>
                    </div>
                    <div className="stu-paymentItemRight">
                      <div className="stu-paymentItemAmount">
                        LKR <span className="stu-amountValue">{parseFloat(history.amount).toLocaleString()}</span>
                      </div>
                      <div className="stu-paymentItemId">{history.payment_method.toUpperCase()}</div>
                    </div>
                    {index < paymentHistory.length - 1 && <div className="stu-paymentItemDivider"></div>}
                  </div>
                )) : (
                  <p className="empty-text">Zero transaction history logged.</p>
                )}
              </div>
              <button className="stu-viewAllBtn" onClick={() => window.print()}>Generate Financial Statement</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
