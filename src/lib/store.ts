import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

const USERS_KEY = "expense_tracker_users";
const CURRENT_USER_KEY = "expense_tracker_current_user";
const TRANSACTIONS_KEY = "expense_tracker_transactions";

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): User[] {
  return getFromStorage<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]) {
  setToStorage(USERS_KEY, users);
}

export function getCurrentUser(): User | null {
  return getFromStorage<User | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: User | null) {
  setToStorage(CURRENT_USER_KEY, user);
}

export function getTransactions(): Transaction[] {
  return getFromStorage<Transaction[]>(TRANSACTIONS_KEY, []);
}

export function saveTransactions(txns: Transaction[]) {
  setToStorage(TRANSACTIONS_KEY, txns);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  const login = useCallback((username: string, password: string): string | null => {
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return "Invalid username or password";
    setCurrentUser(found);
    setUser(found);
    return null;
  }, []);

  const register = useCallback((username: string, email: string, password: string): string | null => {
    const users = getUsers();
    if (users.find(u => u.username === username)) return "Username already taken";
    if (users.find(u => u.email === email)) return "Email already registered";
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      password,
      profilePicture: null,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    setUser(newUser);
    return null;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<User, "username" | "password" | "profilePicture">>) => {
    const users = getUsers();
    const current = getCurrentUser();
    if (!current) return "Not logged in";
    if (updates.username && updates.username !== current.username) {
      if (users.find(u => u.username === updates.username)) return "Username already taken";
    }
    const updated = { ...current, ...updates };
    const newUsers = users.map(u => u.id === current.id ? updated : u);
    saveUsers(newUsers);
    setCurrentUser(updated);
    setUser(updated);
    return null;
  }, []);

  return { user, login, register, logout, updateProfile };
}

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!userId) return;
    const all = getTransactions();
    setTransactions(all.filter(t => t.userId === userId));
  }, [userId]);

  const addTransaction = useCallback((txn: Omit<Transaction, "id" | "createdAt">) => {
    const all = getTransactions();
    const newTxn: Transaction = {
      ...txn,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...all, newTxn];
    saveTransactions(updated);
    setTransactions(updated.filter(t => t.userId === txn.userId));
  }, []);

  const deleteTransaction = useCallback((id: string, userId: string) => {
    const all = getTransactions();
    const updated = all.filter(t => t.id !== id);
    saveTransactions(updated);
    setTransactions(updated.filter(t => t.userId === userId));
  }, []);

  return { transactions, addTransaction, deleteTransaction };
}

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"];
export const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Education", "Rent", "Other"];
