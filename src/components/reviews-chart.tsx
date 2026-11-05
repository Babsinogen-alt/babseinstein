import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ReviewsChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <div className="h-40 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(26, 39, 68, 0.05)" }}
            contentStyle={{
              background: "var(--color-sheet)",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              color: "var(--color-ink)",
              fontSize: 12,
            }}
            formatter={(value) => [`${value ?? 0} retrievals`, ""]}
          />
          <Bar dataKey="count" fill="var(--color-ink)" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
