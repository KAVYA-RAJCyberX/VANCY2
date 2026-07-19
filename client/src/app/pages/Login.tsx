import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/users/login", {
        email: data.email,
        password: data.password
      });
      login(response.data);
      navigate("/");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#F5F1E8] flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-['Playfair_Display'] tracking-[0.2em] uppercase mb-4 text-[#3B121A]">Login</h1>
          <p className="text-[#0A0A0A] font-medium text-sm">Enter your details to access your account.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 text-sm border border-red-200">
              {errorMsg}
            </div>
          )}
          <div>
            <input 
              type="email" 
              placeholder="Email Address" 
              {...register("email")}
              className={`w-full border-b-2 py-3 px-0 focus:outline-none transition-colors bg-transparent text-sm ${errors.email ? 'border-red-500 placeholder-red-300' : 'border-[#0A0A0A] focus:border-[#C9A961] placeholder-[#0A0A0A]/60'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              {...register("password")}
              className={`w-full border-b-2 py-3 px-0 focus:outline-none transition-colors bg-transparent text-sm ${errors.password ? 'border-red-500 placeholder-red-300' : 'border-[#0A0A0A] focus:border-[#C9A961] placeholder-[#0A0A0A]/60'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("remember")} className="w-3 h-3 text-[#0A0A0A] focus:ring-[#0A0A0A] accent-[#0A0A0A]" />
              <span className="text-[#0A0A0A] font-bold tracking-widest uppercase">Remember me</span>
            </label>
            <Link to="#" className="text-gray-500 hover:text-[#0A0A0A] transition-colors font-bold tracking-widest uppercase">Forgot Password?</Link>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0A0A0A] text-white py-4 font-bold tracking-widest uppercase hover:bg-[#C9A961] hover:text-[#0A0A0A] transition-colors mt-8 flex justify-center items-center h-14 rounded-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-[#0A0A0A] font-bold tracking-widest uppercase">
          <p>Don't have an account? <Link to="/register" className="text-[#C9A961] hover:text-[#0A0A0A] transition-colors ml-1">Create one</Link></p>
        </div>

      </div>
    </div>
  );
}
