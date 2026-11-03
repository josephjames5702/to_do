import type { Filter } from '../types/todo';
import Button from './Button';

interface FilterBarProps {
  filter: Filter;
  onChange: (filter: Filter) => void;
  remaining: number;
}

const filters: Filter[] = ['all', 'active', 'completed'];

export default function FilterBar({ filter, onChange, remaining }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-200">
      <span>{remaining} left</span>
      <div className="flex gap-1">
        {filters.map((name) => (
          <Button
            key={name}
            variant={filter === name ? 'primary' : 'ghost'}
            onClick={() => onChange(name)}
            className="capitalize"
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
