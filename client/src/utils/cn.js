// src/utils/cn.js
/**
 * Lightweight className merger.
 * Joins truthy string arguments with a space.
 * Usage: cn("base", condition && "conditional", "always")
 */
const cn = (...classes) => classes.filter(Boolean).join(" ");

export default cn;
