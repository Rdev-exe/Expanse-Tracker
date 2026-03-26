import { useMemo } from "react";
import { useAuth, useTransactions, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, format } from "date-fns";

const COLORS = [
  "hsl(40 90% 55%)", "hsl(152 60% 48%)", "hsl(200 80% 55%)", "hsl(280 70% 60%)",
  "hsl(0 72% 60%)", "hsl(30 85% 55%)", "hsl(170 60% 45%)", "hsl(320 70% 55%)", "hsl(60 70% 50%)",
];

const CategoryChart = ({ data, title, icon }: { data: { name: string; value: number }[]; title: string; icon: React.ReactNode }) => (
  <div className="glass-card p-6">
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
    </div>
    {data.length === 0 ? (
      <p className="text-center text-muted-foreground py-8">No data yet</p>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 18%)" />
          <XAxis type="number" stroke="hsl(215 15% 55%)" fontSize={12} tickFormatter={v => `₹${v}`} />
          <YAxis type="category" dataKey="name" stroke="hsl(215 15% 55%)" fontSize={12} width={100} />
          <Tooltip
            contentStyle={{ background: "hsl(222 41% 10%)", border: "1px solid hsl(222 25% 18%)", borderRadius: "8px", color: "hsl(210 20% 92%)" }}
            formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

const AnalysisPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { transactions } = useTransactions(user?.id);

  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === "income").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return INCOME_CATEGORIES.filter(c => map[c]).map(c => ({ name: c, value: map[c] }));
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return EXPENSE_CATEGORIES.filter(c => map[c]).map(c => ({ name: c, value: map[c] }));
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({ start: subMonths(now, 11), end: now });
    return months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const monthTxns = transactions.filter(t => {
        const d = parseISO(t.date);
        return d >= start && d <= end;
      });
      const inc = monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { month: format(month, "MMM yy"), income: inc, expense: exp, savings: inc - exp };
    });
  }, [transactions]);

  if (!user) { navigate("/"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <h1 className="font-display text-lg font-bold text-foreground">Category Analysis</h1>
        </div>
      </header>

      <main className="container py-8 space-y-8 animate-fade-in">
        <div className="glass-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">12-Month Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 18%)" />
              <XAxis dataKey="month" stroke="hsl(215 15% 55%)" fontSize={11} />
              <YAxis stroke="hsl(215 15% 55%)" fontSize={12} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(222 41% 10%)", border: "1px solid hsl(222 25% 18%)", borderRadius: "8px", color: "hsl(210 20% 92%)" }}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="hsl(152 60% 48%)" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="hsl(0 72% 60%)" strokeWidth={2} name="Expense" />
              <Line type="monotone" dataKey="savings" stroke="hsl(40 90% 55%)" strokeWidth={2} strokeDasharray="5 5" name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CategoryChart data={incomeByCategory} title="Income by Category" icon={<TrendingUp className="h-5 w-5 text-income" />} />
          <CategoryChart data={expenseByCategory} title="Expenses by Category" icon={<TrendingDown className="h-5 w-5 text-expense" />} />
        </div>
      </main>
    </div>
  );
};

export default AnalysisPage;
