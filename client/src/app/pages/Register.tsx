import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import { motion } from "motion/react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/users", {
        name: data.name,
        email: data.email,
        password: data.password
      });
      login(response.data);
      navigate("/account");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "An error occurred during registration");
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
          <h1 className="text-4xl md:text-5xl font-medium tracking-tighter uppercase mb-4">Create Account</h1>
          <p className="text-muted-foreground font-light text-sm">Join the VANCY editorial experience.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {errorMsg && (
            <div className="text-red-500 text-xs uppercase tracking-widest font-medium border-l border-red-500 pl-3">
              {errorMsg}
            </div>
          )}
          
          <div>
            <input 
              type="text" 
              placeholder="Full Name" 
              {...register("name")}
              className={`w-full bg-transparent border-b py-4 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 ${errors.name ? 'border-red-500' : 'border-border focus:border-foreground'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-2 uppercase tracking-widest">{errors.name.message}</p>}
          </div>

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

          <div>
            <input 
              type="password" 
              placeholder="Confirm Password" 
              {...register("confirmPassword")}
              className={`w-full bg-transparent border-b py-4 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 ${errors.confirmPassword ? 'border-red-500' : 'border-border focus:border-foreground'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-2 uppercase tracking-widest">{errors.confirmPassword.message}</p>}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background py-5 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors mt-8 flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register"}
          </button>
        </form>

        <div className="mt-16 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <p>Already have an account? <Link to="/login" className="text-foreground border-b border-foreground pb-0.5 ml-2 hover:opacity-70 transition-opacity">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
