// src/components/ui/Button.jsx
import React from "react";
import { motion } from "framer-motion";
import cn from "../../utils/cn";

const variants = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25",
  secondary:
    "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
  ghost: "text-slate-400 hover:text-white hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-2xl",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...rest
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 cursor-pointer",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default Button;
