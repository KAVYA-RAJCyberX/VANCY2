import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCartStore } from "../../store/useCartStore";
import api from "../../lib/axios";

const addressSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function Checkout() {
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [addressData, setAddressData] = useState<AddressFormValues | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const { items, totalPrice, clearCart } = useCartStore();

  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
  });

  const onAddressSubmit = (data: AddressFormValues) => {
    setAddressData(data);
    setStep("payment");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (paymentMethod === "cod") {
      try {
        const orderData = {
          orderItems: items.map(item => ({
            product: item.id,
            name: item.name,
            qty: item.quantity,
            image: item.image,
            price: item.price,
            size: item.size || 'N/A',
            color: item.color || 'N/A'
          })),
          shippingAddress: {
            street: addressData?.address,
            city: addressData?.city,
            state: addressData?.state,
            postalCode: addressData?.postalCode,
            country: addressData?.country
          },
          guestEmail: addressData?.email,
          paymentMethod: "COD",
          itemsPrice: currentTotal,
          shippingPrice: 0,
          totalPrice: currentTotal,
          isPaid: false
        };
        const { data } = await api.post("/orders", orderData);
        setOrderId(data._id);
        clearCart();
        setStep("success");
      } catch (error) {
        alert("Error creating order");
      }
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      // Create Razorpay Order
      const { data: order } = await api.post("/payments/razorpay", { amount: currentTotal });

      const options = {
        key: "rzp_test_xxxxxx", // Replace with actual Key ID in a real app, ideally from env
        amount: order.amount,
        currency: order.currency,
        name: "VANCY",
        description: "Luxury Menswear",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Create Order in DB
            const orderData = {
              orderItems: items.map(item => ({
                product: item.id,
                name: item.name,
                qty: item.quantity,
                image: item.image,
                price: item.price,
                size: item.size || 'N/A',
                color: item.color || 'N/A'
              })),
              shippingAddress: {
                street: addressData?.address,
                city: addressData?.city,
                state: addressData?.state,
                postalCode: addressData?.postalCode,
                country: addressData?.country
              },
              guestEmail: addressData?.email,
              paymentMethod: "Razorpay",
              paymentResult: {
                id: response.razorpay_payment_id,
                status: "success",
                update_time: new Date().toISOString(),
              },
              itemsPrice: currentTotal,
              shippingPrice: 0,
              totalPrice: currentTotal,
              isPaid: true,
              paidAt: new Date().toISOString()
            };

            const { data: savedOrder } = await api.post("/orders", orderData);
            setOrderId(savedOrder._id);
            clearCart();
            setStep("success");
          } catch (error) {
            alert("Payment Verification Failed");
          }
        },
        prefill: {
          name: `${addressData?.firstName} ${addressData?.lastName}`,
          email: addressData?.email,
          contact: "9999999999", // Mock contact
        },
        theme: {
          color: "#0A0A0A",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      alert("Error initiating payment");
    }
  };

  const currentTotal = totalPrice();

  if (step === "success") {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-12 shadow-sm rounded-lg">
          <CheckCircle2 className="w-20 h-20 text-[#C9A961] mx-auto mb-6" />
          <h1 className="text-3xl font-bold tracking-widest uppercase mb-4">Order Placed</h1>
          <p className="text-gray-600 mb-8">Your order #{orderId || "VAN-83921"} has been confirmed. We'll send you a shipping confirmation email soon.</p>
          <Link to="/" className="inline-block bg-[#0A0A0A] text-white px-8 py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors border hover:border-[#0A0A0A]">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-4 text-[#3B121A]">Checkout</h1>
          <p className="mb-6 text-[#0A0A0A]">Your cart is empty. You cannot proceed to checkout.</p>
          <Link to="/" className="inline-block bg-[#0A0A0A] text-white px-8 py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors rounded-sm">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#F5F1E8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:w-2/3">
            {/* Progress */}
            <div className="flex gap-4 mb-12">
              <div className={`flex-1 pb-2 border-b-2 text-sm font-bold tracking-widest uppercase ${step === "address" ? "border-[#0A0A0A] text-[#0A0A0A]" : "border-gray-300 text-gray-400"}`}>
                1. Shipping
              </div>
              <div className={`flex-1 pb-2 border-b-2 text-sm font-bold tracking-widest uppercase ${step === "payment" ? "border-[#0A0A0A] text-[#0A0A0A]" : "border-gray-300 text-gray-400"}`}>
                2. Payment
              </div>
            </div>

            {step === "address" && (
              <form onSubmit={handleSubmit(onAddressSubmit)} className="bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold tracking-widest uppercase mb-6">Contact Information</h2>
                <div className="mb-8">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    {...register("email")}
                    className={`w-full border p-4 focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                
                <h2 className="text-xl font-bold tracking-widest uppercase mb-6">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="First Name" 
                      {...register("firstName")}
                      className={`w-full border p-4 focus:outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Last Name" 
                      {...register("lastName")}
                      className={`w-full border p-4 focus:outline-none transition-colors ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Address" 
                    {...register("address")}
                    className={`w-full border p-4 focus:outline-none transition-colors ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="City" 
                      {...register("city")}
                      className={`w-full border p-4 focus:outline-none transition-colors ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="State" 
                      {...register("state")}
                      className={`w-full border p-4 focus:outline-none transition-colors ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Postal Code" 
                      {...register("postalCode")}
                      className={`w-full border p-4 focus:outline-none transition-colors ${errors.postalCode ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Country" 
                      {...register("country")}
                      className={`w-full border p-4 focus:outline-none transition-colors ${errors.country ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} 
                    />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0A0A0A] text-white py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors rounded-sm"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {step === "payment" && (
              <div className="bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold tracking-widest uppercase mb-6">Payment Method</h2>
                
                <div className="space-y-4 mb-8">
                  {/* UPI Option */}
                  <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'upi'} 
                        onChange={() => setPaymentMethod('upi')}
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <Smartphone className="w-6 h-6" />
                      <span className="font-medium tracking-widest uppercase text-sm">UPI / QR</span>
                    </div>
                    {paymentMethod === 'upi' && (
                      <div className="mt-4 pl-8">
                        <input type="text" placeholder="Enter UPI ID (e.g., name@upi)" className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black" />
                        <p className="text-xs text-gray-500 mt-2">A payment request will be sent to your UPI app.</p>
                      </div>
                    )}
                  </label>

                  {/* Card Option */}
                  <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'card'} 
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <CreditCard className="w-6 h-6" />
                      <span className="font-medium tracking-widest uppercase text-sm">Credit / Debit Card</span>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="mt-4 pl-8 space-y-3">
                        <p className="text-xs text-gray-500 mb-2">You will be redirected to securely enter your card details.</p>
                      </div>
                    )}
                  </label>

                  {/* COD Option */}
                  <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <span className="font-medium tracking-widest uppercase text-sm">Cash on Delivery (COD)</span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep("address")}
                    className="w-1/3 border-2 border-[#0A0A0A] text-[#0A0A0A] py-4 font-bold tracking-widest uppercase hover:bg-[#F5F1E8] transition-colors rounded-sm"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handlePayment}
                    className="w-2/3 bg-[#0A0A0A] text-white py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors rounded-sm"
                  >
                    Pay ₹{currentTotal.toLocaleString()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 shadow-sm sticky top-32">
              <h2 className="text-lg font-bold tracking-widest uppercase mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#C9A961]">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{currentTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-base font-bold tracking-widest uppercase">Total</span>
                <span className="text-xl font-bold">₹{currentTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
