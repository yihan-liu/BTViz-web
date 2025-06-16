// components/ui/DailyCountsChart.tsx
"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { format, parse, parseISO } from "date-fns";

interface Row {
  /* `date` can be “YYYY-MM-DD”  _or_ “MM-DD” */
  date: string;
  count: number;
}

export default function DailyCountsChart({ rows }: { rows: Row[] }) {
  if (!rows?.length) return null; // guard against empty state

  // normalise the date strings so parseISO is always happy
  const data = rows.map((r) => ({
    ...r,
    iso:
      r.date.length === 10 // already YYYY-MM-DD
        ? r.date
        : format(parse(r.date, "MM-dd", new Date()), "yyyy-MM-dd"),
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daily Data Volume (30 days)</CardTitle>
      </CardHeader>

      <CardContent style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 32 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="iso"
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(d) => format(parseISO(d), "MMM d")}
            />

            <YAxis
              allowDecimals={false}
              /* inline object form is simpler than a <Label> child */
              label={{ value: "Records", angle: -90, position: "insideLeft" }}
            />

            <Tooltip
              labelFormatter={(v) => format(parseISO(v as string), "PPP")}
            />

            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
