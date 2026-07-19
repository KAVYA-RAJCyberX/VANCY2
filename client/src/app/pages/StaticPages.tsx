import { Link } from "react-router";

function StaticPageLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#F5F1E8]">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-black font-['Playfair_Display'] tracking-widest uppercase mb-12 text-center text-[#3B121A]">{title}</h1>
        <div className="bg-white p-8 md:p-12 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <StaticPageLayout title="About VANCY">
      <div className="prose max-w-none text-gray-700 space-y-6">
        <p className="text-lg leading-relaxed">
          VANCY was founded on a singular principle: uncompromising menswear luxury. We believe that true luxury is quiet, crafted with meticulous attention to detail, and designed to stand the test of time.
        </p>
        <p className="leading-relaxed">
          Our journey began when our founders realized a gap in the market for premium, perfectly tailored polo shirts that bridged the gap between casual comfort and formal elegance. After years of sourcing the finest fabrics from centuries-old mills in Biella, Italy, VANCY was born.
        </p>
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A] pt-4">Our Craftsmanship</h3>
        <p className="leading-relaxed">
          We reject mass production. Every VANCY piece is crafted in small, capped runs to ensure exclusivity and unparalleled quality control. From our signature mother-of-pearl buttons to the hand-finished seams, every element is considered.
        </p>
      </div>
    </StaticPageLayout>
  );
}

export function Contact() {
  return (
    <StaticPageLayout title="Contact Us">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-700">
        <div>
          <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A] mb-4">Get in Touch</h3>
          <p className="mb-6">We are here to assist you with styling advice, bespoke requests, or inquiries about your order.</p>
          <div className="space-y-4">
            <p><strong>Email:</strong> concierge@vancy.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Hours:</strong> Mon-Sat, 10:00 AM - 7:00 PM (IST)</p>
          </div>
        </div>
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Name" className="p-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#C9A961]" />
          <input type="email" placeholder="Email" className="p-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#C9A961]" />
          <textarea placeholder="Message" rows={4} className="p-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#C9A961]"></textarea>
          <button type="button" className="bg-[#0A0A0A] text-white py-3 font-bold uppercase tracking-widest hover:bg-[#C9A961] transition-colors">Send Message</button>
        </form>
      </div>
    </StaticPageLayout>
  );
}

export function Shipping() {
  return (
    <StaticPageLayout title="Shipping & Returns">
      <div className="prose max-w-none text-gray-700 space-y-6">
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A]">White-Glove Delivery</h3>
        <p>
          All VANCY orders are shipped via complimentary expedited delivery. Orders placed before 2 PM IST are processed the same business day. Delivery typically takes 2-4 business days within India.
        </p>
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A] pt-4">Signature Packaging</h3>
        <p>
          Your order will arrive in our signature hardbox packaging, designed to protect your garments and provide a premium unboxing experience.
        </p>
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A] pt-4">Returns & Exchanges</h3>
        <p>
          We accept returns and exchanges within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached. Please contact our concierge to initiate a return.
        </p>
      </div>
    </StaticPageLayout>
  );
}

export function Terms() {
  return (
    <StaticPageLayout title="Terms of Service">
      <div className="prose max-w-none text-gray-700 space-y-6">
        <p>Last updated: June 2024</p>
        <p>
          Please read these terms and conditions carefully before using our service. By accessing or using the VANCY website, you agree to be bound by these terms.
        </p>
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A]">Intellectual Property</h3>
        <p>
          The Service and its original content, features, and functionality are and will remain the exclusive property of VANCY and its licensors.
        </p>
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A]">Purchases</h3>
        <p>
          If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase.
        </p>
      </div>
    </StaticPageLayout>
  );
}

export function Privacy() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <div className="prose max-w-none text-gray-700 space-y-6">
        <p>Last updated: June 2024</p>
        <p>
          Your privacy is important to us. It is VANCY's policy to respect your privacy regarding any information we may collect from you across our website.
        </p>
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A]">Information We Collect</h3>
        <p>
          We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
        </p>
        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0A0A0A]">How We Use Information</h3>
        <p>
          We use the information we collect in various ways, including to provide, operate, and maintain our website; improve, personalize, and expand our website; and understand and analyze how you use our website.
        </p>
      </div>
    </StaticPageLayout>
  );
}

export function FAQ() {
  return (
    <StaticPageLayout title="Frequently Asked Questions">
      <div className="space-y-6 text-gray-700">
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-bold text-[#0A0A0A] mb-2">How do I determine my size?</h4>
          <p>Please refer to our detailed Size Guide available on every product page. If you are between sizes, we recommend sizing up for a more relaxed fit.</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-bold text-[#0A0A0A] mb-2">What is the difference between VANCY and VANCY Privé?</h4>
          <p>VANCY Privé is our most exclusive tier, featuring strictly limited production runs, rare fabrics (like Cashmere Silk), and artisan hand-finishing.</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-bold text-[#0A0A0A] mb-2">Do you offer international shipping?</h4>
          <p>Currently, we ship exclusively within India. We plan to expand to international markets in the near future.</p>
        </div>
      </div>
    </StaticPageLayout>
  );
}
