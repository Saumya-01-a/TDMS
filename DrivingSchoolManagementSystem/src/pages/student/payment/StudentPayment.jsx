import React, { useState } from "react";
import "./studentPayment.css";

export default function StudentPayment() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    amount: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Payment submitted (mock)");
  };

  const pendingPayments = [
    {
      id: 1,
      title: "Driving Package - Premium",
      dueDate: "2024-09-15",
      amount: 15000,
      invoiceId: "INV-2024-001",
    },
    {
      id: 2,
      title: "Trial Exam Fee - Bike",
      dueDate: "2024-09-20",
      amount: 2500,
      invoiceId: "INV-2024-002",
    },
  ];

  const paymentHistory = [
    {
      id: 1,
      title: "Registration Fee",
      paidDate: "2024-08-01",
      amount: 5000,
      reference: "REF-2024-001",
    },
    {
      id: 2,
      title: "Bike Sessions (5)",
      paidDate: "2024-08-10",
      amount: 10000,
      reference: "REF-2024-002",
    },
    {
      id: 3,
      title: "Initial Deposit",
      paidDate: "2024-08-15",
      amount: 20000,
      reference: "REF-2024-003",
    },
  ];

  return (
    <div className="stu-paymentWrapper">
      <h1 className="stu-paymentTitle">Online Payment</h1>

      <div className="stu-paymentContainer">
        {/* Left Column - Payment Form */}
        <div className="stu-paymentFormSection">
          <div className="stu-paymentFormCard">
            <h2 className="stu-formCardTitle">Make a Payment</h2>
            <p className="stu-formCardSubtitle">
              Choose your preferred payment method
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
                    Pay with Visa, Mastercard, or other cards
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
                    Direct bank transfer to our account
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
                {/* Amount */}
                <div className="stu-formGroup">
                  <label htmlFor="amount" className="stu-formLabel">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    className="stu-formInput"
                    required
                  />
                </div>

                {/* Card Number */}
                <div className="stu-formGroup">
                  <label htmlFor="cardNumber" className="stu-formLabel">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleFormChange}
                    className="stu-formInput"
                    required
                  />
                </div>

                {/* Cardholder Name */}
                <div className="stu-formGroup">
                  <label htmlFor="cardholderName" className="stu-formLabel">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    placeholder="John Doe"
                    value={formData.cardholderName}
                    onChange={handleFormChange}
                    className="stu-formInput"
                    required
                  />
                </div>

                {/* Expiry Date and CVV */}
                <div className="stu-formRow">
                  <div className="stu-formGroup">
                    <label htmlFor="expiryDate" className="stu-formLabel">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="12/25"
                      value={formData.expiryDate}
                      onChange={handleFormChange}
                      className="stu-formInput"
                      required
                    />
                  </div>
                  <div className="stu-formGroup">
                    <label htmlFor="cvv" className="stu-formLabel">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleFormChange}
                      className="stu-formInput"
                      required
                    />
                  </div>
                </div>

                {/* Pay Now Button */}
                <button type="submit" className="stu-payNowBtn">
                  Pay Now
                </button>
              </form>
            )}

            {selectedPaymentMethod === "bank" && (
              <div className="stu-bankTransferInfo">
                <p>
                  Please transfer the amount to the following account details:
                </p>
                <div className="stu-bankDetails">
                  <p>
                    <strong>Bank Name:</strong> National Bank
                  </p>
                  <p>
                    <strong>Account Number:</strong> 1234567890
                  </p>
                  <p>
                    <strong>Branch Code:</strong> 001
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Payment Info */}
        <div className="stu-paymentInfoSection">
          {/* Pending Payments Card */}
          <div className="stu-paymentInfoCard">
            <h3 className="stu-infoCardTitle">Pending Payments</h3>
            <div className="stu-paymentItemsList">
              {pendingPayments.map((payment, index) => (
                <div key={payment.id} className="stu-paymentItem">
                  <div className="stu-paymentItemLeft">
                    <div className="stu-paymentItemTitle">{payment.title}</div>
                    <div className="stu-paymentItemDate">Due: {payment.dueDate}</div>
                  </div>
                  <div className="stu-paymentItemRight">
                    <div className="stu-paymentItemAmount">
                      LKR <span className="stu-amountValue">{payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="stu-paymentItemId">{payment.invoiceId}</div>
                  </div>
                  {index < pendingPayments.length - 1 && (
                    <div className="stu-paymentItemDivider"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment History Card */}
          <div className="stu-paymentInfoCard">
            <h3 className="stu-infoCardTitle">Payment History</h3>
            <div className="stu-paymentItemsList">
              {paymentHistory.map((history, index) => (
                <div key={history.id} className="stu-paymentItem">
                  <div className="stu-paymentItemLeft">
                    <div className="stu-paymentItemTitle">{history.title}</div>
                    <div className="stu-paymentItemDate">Paid: {history.paidDate}</div>
                  </div>
                  <div className="stu-paymentItemRight">
                    <div className="stu-paymentItemAmount">
                      LKR <span className="stu-amountValue">{history.amount.toLocaleString()}</span>
                    </div>
                    <div className="stu-paymentItemId">{history.reference}</div>
                  </div>
                  {index < paymentHistory.length - 1 && (
                    <div className="stu-paymentItemDivider"></div>
                  )}
                </div>
              ))}
            </div>
            <button className="stu-viewAllBtn">View All Transactions</button>
          </div>
        </div>
      </div>
    </div>
  );
}
