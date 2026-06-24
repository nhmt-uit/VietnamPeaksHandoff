/** 5 chấm độ khó; tô màu theo cấp (var --color-diff-1..5), còn lại xám. */
const DOT: Record<number, string> = {
  1: "bg-diff-1",
  2: "bg-diff-2",
  3: "bg-diff-3",
  4: "bg-diff-4",
  5: "bg-diff-5",
};

export function DifficultyDots({ level }: { level: number | null }) {
  if (!level) return null;
  return (
    <span
      className="inline-flex items-center gap-1 align-middle"
      title={`Độ khó ${level}/5`}
      aria-label={`Độ khó ${level} trên 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i <= level ? DOT[level] : "bg-rock-300"}`}
        />
      ))}
    </span>
  );
}
