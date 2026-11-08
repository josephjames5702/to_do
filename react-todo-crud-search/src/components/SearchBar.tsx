export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      className="search"
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search todos…"
    />
  );
}
