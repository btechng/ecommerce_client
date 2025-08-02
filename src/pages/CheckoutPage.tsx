import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PaystackButton } from "react-paystack";
import { Dialog, Transition } from "@headlessui/react";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("userEmail") || "user@example.com";

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-server-or19.onrender.com/api/cart",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCart(res.data);
      } catch (err) {
        setErrorMessage("Failed to fetch cart");
        setErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const publicKey = "pk_live_755c52be93e9db58f39401f0ecb9d20df9e0cdbe";
  const amount = calculateTotal() * 100;
  const reference = `ref-${Date.now()}`;

  const paystackProps = {
    email,
    amount,
    reference,
    publicKey,
    metadata: {
      custom_fields: [
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: phone,
        },
        {
          display_name: "Shipping Address",
          variable_name: "shipping_address",
          value: address,
        },
      ],
    },
    onSuccess: async (response: any) => {
      setPlacingOrder(true);
      setReferenceCode(response.reference);

      try {
        const orderPayload = {
          cart,
          address,
          phone,
          totalAmount: calculateTotal(),
          paymentRef: response.reference,
        };

        await axios.post(
          "https://ecommerce-server-or19.onrender.com/api/cart/checkout",
          orderPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.delete(
          "https://ecommerce-server-or19.onrender.com/api/cart/clear",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        localStorage.removeItem("cart");
        setSuccessModal(true);
      } catch (err: any) {
        setErrorMessage(
          err.response?.data?.error || "Order failed after payment"
        );
        setErrorModal(true);
      } finally {
        setPlacingOrder(false);
      }
    },
    onClose: () => {
      setErrorMessage("Payment dialog was closed");
      setErrorModal(true);
    },
  };

  if (loading) return <div className="p-4 pt-24">Loading cart...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-24">
      <h1 className="text-2xl font-bold mb-4">🧾 Checkout</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center gap-4 border p-3 rounded"
              >
                <img
                  src={
                    item.product.imageUrl || "https://via.placeholder.com/80"
                  }
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    ₦{item.product.price?.toLocaleString()} x {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Shipping Info</h2>
            <input
              className="w-full border p-2 mb-2"
              placeholder="Shipping Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              className="w-full border p-2 mb-4"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="text-right text-lg font-bold mb-4">
              Total: ₦{calculateTotal().toLocaleString()}
            </div>

            <PaystackButton
              {...paystackProps}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              disabled={!address || !phone || placingOrder}
            >
              {placingOrder ? "Placing Order..." : "✅ Pay Now"}
            </PaystackButton>
          </div>
        </>
      )}

      {/* 🔄 Loading Spinner (during order placing) */}
      {placingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
            <svg
              className="animate-spin h-6 w-6 text-green-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Placing your order...</span>
          </div>
        </div>
      )}

      {/* ✅ Success Modal with Transaction Summary */}
      <Transition appear show={successModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            leave="ease-in duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl max-w-sm mx-auto">
              <Dialog.Title className="text-green-600 text-xl font-bold mb-2">
                🎉 Payment Successful!
              </Dialog.Title>
              <Dialog.Description className="mb-4 text-sm">
                Your order has been placed. Here’s your transaction summary:
              </Dialog.Description>
              <ul className="mb-4 text-sm space-y-1">
                <li>
                  🛒 <strong>Items:</strong> {cart.length}
                </li>
                <li>
                  💰 <strong>Amount:</strong> ₦
                  {calculateTotal().toLocaleString()}
                </li>
                <li>
                  🧾 <strong>Ref:</strong> {referenceCode}
                </li>
              </ul>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
                onClick={() => navigate("/my-orders")}
              >
                View My Orders
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* ❌ Error Modal */}
      <Transition appear show={errorModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setErrorModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            leave="ease-in duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl max-w-sm mx-auto">
              <Dialog.Title className="text-red-600 text-xl font-bold mb-2">
                ❌ Checkout Failed
              </Dialog.Title>
              <Dialog.Description className="mb-4 text-sm">
                {errorMessage || "Something went wrong during checkout."}
              </Dialog.Description>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded w-full"
                onClick={() => setErrorModal(false)}
              >
                Close
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CheckoutPage;
