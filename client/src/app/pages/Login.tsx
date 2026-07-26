import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import { motion } from "motion/react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password
      });
      login(response.data);
      navigate("/account");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-background flex flex-col justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto px-6"
      >
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tighter uppercase mb-4">Sign In</h1>
          <p className="text-muted-foreground font-light text-sm">Access your VANCY account.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {errorMsg && (
            <div className="text-red-500 text-xs uppercase tracking-widest font-medium border-l border-red-500 pl-3">
              {errorMsg}
            </div>
          )}
          
          <div>
            <input 
              type="email" 
              placeholder="Email Address" 
              {...register("email")}
              className={`w-full bg-transparent border-b py-4 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 ${errors.email ? 'border-red-500' : 'border-border focus:border-foreground'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-2 uppercase tracking-widest">{errors.email.message}</p>}
          </div>
          
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              {...register("password")}
              className={`w-full bg-transparent border-b py-4 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 ${errors.password ? 'border-red-500' : 'border-border focus:border-foreground'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-2 uppercase tracking-widest">{errors.password.message}</p>}
          </div>
          
          <div className="flex justify-between items-center text-xs font-medium uppercase tracking-widest pt-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Forgot Password?</Link>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background py-5 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors mt-8 flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-16 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <p>Don't have an account? <Link to="/register" className="text-foreground border-b border-foreground pb-0.5 ml-2 hover:opacity-70 transition-opacity">Create one</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
