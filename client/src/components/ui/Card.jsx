// src/components/ui/Card.jsx
import React from "react";
import { motion } from "framer-motion";
import cn from "../../utils/cn";

const Card = ({ children, className = "", hover = false, ...rest }) => {
  const base =
    "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-xl shadow-black/20";

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(base, className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(base, className)} {...rest}>
      {children}
    </div>
  );
};

export default Card;
