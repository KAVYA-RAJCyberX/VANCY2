import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCartStore } from "../../store/useCartStore";
import api from "../../lib/axios";
import { motion, AnimatePresence } from "motion/react";

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
      const { data: order } = await api.post("/payments/razorpay", { amount: currentTotal });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxxx",
        amount: order.amount,
        currency: order.currency,
        name: "VANCY",
        description: "Timeless Essentials",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

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
          contact: "9999999999",
        },
        theme: {
          color: "#111111",
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
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
        className="pt-40 pb-24 min-h-screen bg-background flex flex-col items-center text-center px-6"
      >
        <CheckCircle2 className="w-16 h-16 text-foreground mb-12" strokeWidth={1} />
        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter uppercase mb-6">Confirmed</h1>
        <p className="text-muted-foreground font-light text-lg max-w-md mb-16 leading-relaxed">
          Your order #{orderId || "VAN-83921"} has been received. We'll send you a shipping confirmation shortly.
        </p>
        <Link to="/category/all" className="inline-block border border-foreground text-foreground px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500">
          Continue Exploring
        </Link>
      </motion.div>
    );
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="pt-40 pb-24 min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter uppercase mb-6">Checkout</h1>
        <p className="text-muted-foreground font-light mb-16 text-lg">Your bag is empty.</p>
        <Link to="/category/all" className="inline-block border border-foreground text-foreground px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          
          {/* Left Column: Form */}
          <div className="lg:w-3/5">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter uppercase mb-16">Checkout</h1>

            {/* Progress */}
            <div className="flex gap-8 mb-16">
              <div className={`flex-1 pb-4 border-b text-xs font-medium tracking-widest uppercase transition-colors ${step === "address" ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                1. Shipping
              </div>
              <div className={`flex-1 pb-4 border-b text-xs font-medium tracking-widest uppercase transition-colors ${step === "payment" ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                2. Payment
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "address" && (
                <motion.form 
                  key="address"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
                  onSubmit={handleSubmit(onAddressSubmit)} 
                >
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Contact Information</h2>
                  <div className="mb-12">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      autoComplete="email"
                      {...register("email")}
                      className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
                  </div>
                  
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        autoComplete="given-name"
                        {...register("firstName")}
                        className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        autoComplete="family-name"
                        {...register("lastName")}
                        className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.lastName ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <input 
                      type="text" 
                      placeholder="Address" 
                      autoComplete="street-address"
                      {...register("address")}
                      className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.address ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <input 
                        type="text" 
                        placeholder="City" 
                        autoComplete="address-level2"
                        {...register("city")}
                        className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.city ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="State" 
                        autoComplete="address-level1"
                        {...register("state")}
                        className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.state ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-16">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Postal Code" 
                        autoComplete="postal-code"
                        {...register("postalCode")}
                        className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.postalCode ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Country" 
                        autoComplete="country-name"
                        {...register("country")}
                        className={`w-full bg-transparent border-b p-4 focus:outline-none transition-colors ${errors.country ? 'border-red-500' : 'border-border focus:border-foreground'}`} 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-foreground text-background py-5 font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </motion.form>
              )}

              {step === "payment" && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Payment Method</h2>
                  
                  <div className="space-y-4 mb-16">
                    <label className={`block border p-6 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Smartphone className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                          <span className="font-medium tracking-wide text-sm">UPI / QR</span>
                        </div>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'upi'} 
                          onChange={() => setPaymentMethod('upi')}
                          className="w-4 h-4 accent-foreground"
                        />
                      </div>
                    </label>

                    <label className={`block border p-6 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                          <span className="font-medium tracking-wide text-sm">Credit / Debit Card</span>
                        </div>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'card'} 
                          onChange={() => setPaymentMethod('card')}
                          className="w-4 h-4 accent-foreground"
                        />
                      </div>
                    </label>

                    <label className={`block border p-6 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-medium tracking-wide text-sm">Cash on Delivery</span>
                        </div>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'cod'} 
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 accent-foreground"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handlePayment}
                      className="w-full bg-foreground text-background py-5 font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                    >
                      Pay ₹{currentTotal.toLocaleString()}
                    </button>
                    <button 
                      onClick={() => setStep("address")}
                      className="w-full bg-transparent border border-foreground text-foreground py-5 font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
                    >
                      Back to Shipping
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-2/5">
            <div className="sticky top-32">
              <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">Order Summary</h2>
              
              <div className="flex flex-col gap-6 mb-12">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="w-20 aspect-[3/4] bg-muted overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between pt-1">
                      <div>
                        <h4 className="text-sm font-medium mb-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} / Size: {item.size}</p>
                      </div>
                      <span className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-8 space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{currentTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">Complimentary</span>
                </div>
              </div>

              <div className="border-t border-border pt-8 flex justify-between items-center">
                <span className="text-sm font-medium tracking-widest uppercase">Total</span>
                <span className="text-2xl font-medium">₹{currentTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
