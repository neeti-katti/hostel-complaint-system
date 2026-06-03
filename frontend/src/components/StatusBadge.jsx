const STYLES = {
  Pending: 'bg-blush-soft text-blush-ink',
  'In Progress': 'bg-caramel-soft text-caramel-ink',
  Resolved: 'bg-rose-soft text-rose-ink',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.16em] ${
        STYLES[status] || 'bg-line2 text-taupe'
      }`}
    >
      {status}
    </span>
  );
}
