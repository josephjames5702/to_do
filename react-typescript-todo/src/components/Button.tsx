import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'danger' | 'ghost' | 'auth' | 'link';

const variantClass: Record<Variant, string> = {
  // Tailwind variants (to-do screen)
  primary:
    'rounded-lg px-3 py-2 text-sm font-medium transition bg-white text-[#020631] hover:bg-slate-200',
  danger:
    'rounded-lg px-3 py-2 text-sm font-medium transition bg-red-100 text-red-600 hover:bg-red-200',
  ghost:
    'rounded-lg px-3 py-2 text-sm font-medium transition bg-transparent text-slate-100 hover:bg-white/10',
  // Original login-page styles (from App.css)
  auth: 'primary-button',
  link: '',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Reusable button used on both the login page and the to-do screen. */
export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClass[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
