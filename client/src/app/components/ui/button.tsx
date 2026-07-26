import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { VancyLeaf } from "./Icons";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-4 text-sm font-medium uppercase tracking-widest transition-all duration-500 relative group cursor-pointer",
  {
    variants: {
      variant: {
        default: "text-foreground",
        outline: "border border-border px-8 py-4 text-foreground hover:bg-foreground hover:text-background",
        ghost: "text-muted-foreground hover:text-foreground",
        destructive: "text-destructive",
        secondary: "text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        sm: "text-xs",
        lg: "text-base",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  withArrow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withArrow = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {withArrow && (
          <span className="relative flex items-center h-4 w-12 overflow-hidden shrink-0">
            {/* The custom branch arrow line */}
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-current group-hover:w-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"></span>
            {/* Arrow head */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 border-t border-r border-current w-2 h-2 rotate-45 transform translate-x-4 group-hover:translate-x-0 transition-transform duration-700 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 group-hover:opacity-100"></span>
            
            {/* Tiny Gold Leaf on hover */}
            <motion.span 
              className="absolute right-2 text-accent opacity-0 group-hover:opacity-100 pointer-events-none"
              initial={{ scale: 0.5, rotate: -30 }}
              whileHover={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <VancyLeaf size={14} strokeWidth={1.5} />
            </motion.span>
          </span>
        )}
        {!withArrow && variant === 'default' && (
          <span className="absolute left-0 bottom-[-4px] w-full h-[1px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-[cubic-bezier(0.16,1,0.3,1)]"></span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
