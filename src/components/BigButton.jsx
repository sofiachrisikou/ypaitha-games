// Μεγάλο κουμπί για touch (κατάλληλο για δάχτυλο, χωρίς πληκτρολόγιο).
export default function BigButton({ children, onClick, variant = 'primary', className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`big-button big-button--${variant} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
