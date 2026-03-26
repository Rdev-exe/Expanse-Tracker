import { useState } from "react";
import { useAuth } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Wallet } from "lucide-react";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (isRegister) {
      if (!email.trim()) { setError("Please enter email"); return; }
      if (password !== confirmPassword) { setError("Passwords do not match"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      const err = register(username.trim(), email.trim(), password);
      if (err) { setError(err); return; }
    } else {
      const err = login(username.trim(), password);
      if (err) { setError(err); return; }
    }
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl premium-gradient gold-glow">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">ExpenseTracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Premium financial management</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <h2 className="mb-6 text-center font-display text-xl font-semibold text-foreground">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Username</label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {isRegister && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-secondary/50 border-border/50 pr-10 text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-expense">{error}</p>
            )}

            <Button type="submit" className="w-full premium-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-sm text-primary hover:underline"
            >
              {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Creator credit */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Created by <span className="font-semibold text-primary">RI$HI</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
