import { useState, useEffect } from "react";
import { Save } from "lucide-react";

export function Settings() {
  const [storeName, setStoreName] = useState("VANCY");
  const [contactEmail, setContactEmail] = useState("support@vancy.com");
  const [taxRate, setTaxRate] = useState("18");
  const [shippingFee, setShippingFee] = useState("150");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load from local storage if exists
    const stored = localStorage.getItem('vancy_admin_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      setStoreName(parsed.storeName || "VANCY");
      setContactEmail(parsed.contactEmail || "support@vancy.com");
      setTaxRate(parsed.taxRate || "18");
      setShippingFee(parsed.shippingFee || "150");
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = { storeName, contactEmail, taxRate, shippingFee };
    localStorage.setItem('vancy_admin_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Store Settings</h2>
      </div>
      
      <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        {isSaved && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">
            Settings saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 uppercase tracking-widest">Store Name</label>
            <input 
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-gray-900"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 uppercase tracking-widest">Contact Email</label>
            <input 
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 uppercase tracking-widest">Default Tax Rate (%)</label>
            <input 
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-gray-900"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 uppercase tracking-widest">Flat Shipping Fee (₹)</label>
            <input 
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded text-sm font-medium uppercase tracking-widest flex items-center hover:bg-gray-800 transition-colors">
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
