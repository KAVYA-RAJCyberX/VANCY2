import { Link } from "react-router";

function StaticPageLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-32 pb-32 bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase mb-16">{title}</h1>
        <div className="prose max-w-none text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <div className="container mx-auto px-6 lg:px-12 pt-32 pb-32 max-w-5xl">
        <h1 className="text-[clamp(3rem,8vw,8rem)] leading-[0.9] font-medium tracking-tighter uppercase mb-24">
          Designed<br/>Without<br/>Compromise.
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div className="aspect-[4/5] bg-muted overflow-hidden">
            <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1500&auto=format&fit=crop" alt="Craftsmanship" className="w-full h-full object-cover mix-blend-multiply" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-lg md:text-2xl font-light leading-relaxed mb-8">
              VANCY was founded on a singular principle: true luxury is quiet. We believe in creating garments that don't need to shout to be noticed.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed mb-8">
              Every element of our essentials is heavily considered. We source our fabrics from the finest mills globally, ensuring that each piece not only looks impeccable but ages beautifully over time.
            </p>
            <Link to="/collections" className="w-fit text-sm font-medium uppercase tracking-widest border-b border-foreground pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-all">
              Discover Collections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <StaticPageLayout title="Contact">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-muted-foreground font-light">
        <div>
          <p className="mb-12 leading-relaxed">For styling advice, bespoke requests, or inquiries about your order, our concierge is at your service.</p>
          <div className="space-y-6 text-sm">
            <div>
              <span className="block font-medium text-foreground uppercase tracking-widest mb-1">Email</span>
              <a href="mailto:concierge@vancy.com" className="hover:text-foreground transition-colors">concierge@vancy.com</a>
            </div>
            <div>
              <span className="block font-medium text-foreground uppercase tracking-widest mb-1">Phone</span>
              <p>+91 98765 43210</p>
            </div>
            <div>
              <span className="block font-medium text-foreground uppercase tracking-widest mb-1">Hours</span>
              <p>Mon-Sat, 10:00 AM - 7:00 PM (IST)</p>
            </div>
          </div>
        </div>
        <form className="flex flex-col gap-8">
          <input type="text" placeholder="Name" className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-foreground transition-colors" />
          <input type="email" placeholder="Email" className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-foreground transition-colors" />
          <textarea placeholder="Message" rows={4} className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-foreground transition-colors resize-none"></textarea>
          <button type="button" className="w-full bg-foreground text-background py-5 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors">Send Message</button>
        </form>
      </div>
    </StaticPageLayout>
  );
}

export function Shipping() {
  return (
    <StaticPageLayout title="Shipping & Returns">
      <div className="space-y-12 font-light leading-relaxed">
        <div>
          <h3 className="text-xl font-medium text-foreground mb-4">White-Glove Delivery</h3>
          <p>All orders are shipped via complimentary expedited delivery. Orders placed before 2 PM IST are processed the same business day. Delivery typically takes 2-4 business days.</p>
        </div>
        <div>
          <h3 className="text-xl font-medium text-foreground mb-4">Signature Packaging</h3>
          <p>Your order will arrive in our signature hardbox packaging, designed to protect your garments and provide a premium unboxing experience.</p>
        </div>
        <div>
          <h3 className="text-xl font-medium text-foreground mb-4">Returns & Exchanges</h3>
          <p>We accept returns and exchanges within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached.</p>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export function Terms() {
  return (
    <StaticPageLayout title="Terms">
      <div className="space-y-8 font-light leading-relaxed">
        <p>Last updated: June 2026</p>
        <p>By accessing or using the VANCY website, you agree to be bound by these terms.</p>
        <div>
          <h3 className="text-xl font-medium text-foreground mb-4">Intellectual Property</h3>
          <p>The Service and its original content are and will remain the exclusive property of VANCY and its licensors.</p>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export function Privacy() {
  return (
    <StaticPageLayout title="Privacy">
      <div className="space-y-8 font-light leading-relaxed">
        <p>Last updated: June 2026</p>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
        <div>
          <h3 className="text-xl font-medium text-foreground mb-4">How We Use Information</h3>
          <p>We use the information we collect to operate our website, improve your experience, and understand how you interact with our brand.</p>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export function FAQ() {
  return (
    <StaticPageLayout title="FAQ">
      <div className="space-y-8 font-light">
        <div className="border-b border-border pb-8">
          <h4 className="text-lg font-medium text-foreground mb-4">How do I determine my size?</h4>
          <p className="leading-relaxed">Please refer to our detailed Size Guide available on every product page. Our fits are tailored, so if you are between sizes, we recommend sizing up for a more relaxed editorial fit.</p>
        </div>
        <div className="border-b border-border pb-8">
          <h4 className="text-lg font-medium text-foreground mb-4">What is the difference between VANCY and VANCY Privé?</h4>
          <p className="leading-relaxed">VANCY Privé is our most exclusive tier, featuring strictly limited production runs, rare fabrics, and artisan hand-finishing.</p>
        </div>
        <div className="border-b border-border pb-8">
          <h4 className="text-lg font-medium text-foreground mb-4">Do you offer international shipping?</h4>
          <p className="leading-relaxed">Currently, we ship exclusively within India. We plan to expand to select international markets in the near future.</p>
        </div>
      </div>
    </StaticPageLayout>
  );
}
