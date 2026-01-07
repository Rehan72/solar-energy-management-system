import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ================================
   🌞 SOLAR BUTTON VARIANTS
================================ */
const buttonVariants = cva(
  `
  inline-flex items-center justify-center gap-2
  rounded-md text-sm font-semibold
  transition-all duration-200
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-solar-gold
  focus-visible:ring-offset-2
  ring-offset-solar-bgDark
  disabled:opacity-50
  disabled:pointer-events-none
  `,
  {
    variants: {
      variant: {
        default: `
          bg-solar-gold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark
          hover:bg-solar-gold/90
          shadow-md
          hover:shadow-[0_0_20px_rgba(212,174,85,0.35)]
        `,
        outline: `
          border border-solar-gold
          bg-transparent text-solar-textPrimaryLight dark:text-solar-textPrimaryDark
          hover:bg-solar-gold/10
        `,
        ghost: `
          bg-transparent text-solar-gold
          hover:bg-solar-gold/10
        `,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/* ================================
   🔘 BUTTON COMPONENT
================================ */
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
