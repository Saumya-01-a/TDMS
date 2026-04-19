import "./common.css";

export default function Input({ type = "text", placeholder = "", value = "", onChange, name = "", required = false, className = "" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      required={required}
      className={`input-field ${className}`}
    />
  );
}
