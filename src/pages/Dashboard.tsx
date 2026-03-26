import { useState, useMemo } from "react";
import { useAuth, useTransactions, INCOME_CATEGORIES, EXPENSE_CATEGORIES, Transaction } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  Plus, Minus, TrendingUp, TrendingDown, Wallet, LogOut,
  PieChart, User, Download, Trash2,
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { transactions, addTransaction, deleteTransaction } = useTransactions(user?.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [txnType, setTxnType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [chartType, setChartType] = useState<"line" | "bar">("bar");

  if (!user) {
    navigate("/");
    return null;
  }

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
    return months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const monthTxns = transactions.filter(t => {
        const d = parseISO(t.date);
        return d >= start && d <= end;
      });
      return {
        month: format(month, "MMM"),
        income: monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !user) return;
    addTransaction({
      userId: user.id,
      type: txnType,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date,
    });
    setAmount("");
    setCategory("");
    setDescription("");
    setShowAddForm(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Expense Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), "dd MMM yyyy")}`, 14, 30);
    doc.text(`User: ${user.username}`, 14, 36);
    doc.text(`Balance: ₹${balance.toLocaleString("en-IN")}`, 14, 42);

    autoTable(doc, {
      startY: 50,
      head: [["Date", "Type", "Category", "Description", "Amount (₹)"]],
      body: transactions
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(t => [
          format(parseISO(t.date), "dd MMM yyyy"),
          t.type.charAt(0).toUpperCase() + t.type.slice(1),
          t.category,
          t.description || "-",
          (t.type === "expense" ? "-" : "+") + t.amount.toLocaleString("en-IN"),
        ]),
    });

    doc.save("expense-report.pdf");
  };

  const categories = txnType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const recentTxns = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  const formatINR = (val: number) => `₹${val.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg premium-gradient">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">ExpenseTracker</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/analysis")} className="text-muted-foreground hover:text-foreground">
              <PieChart className="mr-1.5 h-4 w-4" /> Analysis
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground">
              <User className="mr-1.5 h-4 w-4" /> Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadPDF} className="text-muted-foreground hover:text-foreground">
              <Download className="mr-1.5 h-4 w-4" /> PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }} className="text-expense hover:text-expense">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-income/15">
                <TrendingUp className="h-5 w-5 text-income" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="font-display text-2xl font-bold text-income">{formatINR(totalIncome)}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-expense/15">
                <TrendingDown className="h-5 w-5 text-expense" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="font-display text-2xl font-bold text-expense">{formatINR(totalExpense)}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 gold-glow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg premium-gradient">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-display text-2xl font-bold text-primary">{formatINR(balance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Transaction */}
        <div className="flex justify-end">
          <Button onClick={() => setShowAddForm(!showAddForm)} className="premium-gradient text-primary-foreground font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Add Transaction
          </Button>
        </div>

        {showAddForm && (
          <div className="glass-card p-6 animate-fade-in">
            <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={txnType === "income" ? "default" : "outline"}
                  onClick={() => { setTxnType("income"); setCategory(""); }}
                  className={txnType === "income" ? "bg-income text-income-foreground hover:bg-income/90" : "text-muted-foreground"}
                  size="sm"
                >
                  <Plus className="mr-1 h-3 w-3" /> Income
                </Button>
                <Button
                  type="button"
                  variant={txnType === "expense" ? "default" : "outline"}
                  onClick={() => { setTxnType("expense"); setCategory(""); }}
                  className={txnType === "expense" ? "bg-expense text-expense-foreground hover:bg-expense/90" : "text-muted-foreground"}
                  size="sm"
                >
                  <Minus className="mr-1 h-3 w-3" /> Expense
                </Button>
              </div>
              <Input
                type="number"
                placeholder="Amount (₹)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="bg-secondary/50 border-border/50 text-foreground"
                min="0"
                step="0.01"
                required
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary/50 border-border/50 text-foreground">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="bg-secondary/50 border-border/50 text-foreground"
              />
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-secondary/50 border-border/50 text-foreground"
                required
              />
              <Button type="submit" className="premium-gradient text-primary-foreground font-semibold">Save</Button>
            </form>
          </div>
        )}

        {/* Chart */}
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Monthly Overview</h2>
            <div className="flex gap-2">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
                className={chartType === "bar" ? "premium-gradient text-primary-foreground" : "text-muted-foreground"}
              >
                Bar
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("line")}
                className={chartType === "line" ? "premium-gradient text-primary-foreground" : "text-muted-foreground"}
              >
                Line
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "bar" ? (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 18%)" />
                <XAxis dataKey="month" stroke="hsl(215 15% 55%)" fontSize={12} />
                <YAxis stroke="hsl(215 15% 55%)" fontSize={12} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 41% 10%)", border: "1px solid hsl(222 25% 18%)", borderRadius: "8px", color: "hsl(210 20% 92%)" }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                />
                <Legend />
                <Bar dataKey="income" fill="hsl(152 60% 48%)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="hsl(0 72% 60%)" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            ) : (
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 18%)" />
                <XAxis dataKey="month" stroke="hsl(215 15% 55%)" fontSize={12} />
                <YAxis stroke="hsl(215 15% 55%)" fontSize={12} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 41% 10%)", border: "1px solid hsl(222 25% 18%)", borderRadius: "8px", color: "hsl(210 20% 92%)" }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="hsl(152 60% 48%)" strokeWidth={2} dot={{ fill: "hsl(152 60% 48%)" }} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="hsl(0 72% 60%)" strokeWidth={2} dot={{ fill: "hsl(0 72% 60%)" }} name="Expense" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Recent Transactions</h2>
          {recentTxns.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet. Add your first one!</p>
          ) : (
            <div className="space-y-3">
              {recentTxns.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.type === "income" ? "bg-income/15" : "bg-expense/15"}`}>
                      {t.type === "income" ? <TrendingUp className="h-4 w-4 text-income" /> : <TrendingDown className="h-4 w-4 text-expense" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.category}</p>
                      <p className="text-xs text-muted-foreground">{t.description || "No description"} • {format(parseISO(t.date), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-display font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </span>
                    <button onClick={() => deleteTransaction(t.id, t.userId)} className="text-muted-foreground hover:text-expense transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
