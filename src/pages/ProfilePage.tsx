import { useState, useRef } from "react";
import { useAuth } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Check, User } from "lucide-react";

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  if (!user) { navigate("/"); return null; }

  const handleUsernameChange = () => {
    if (!newUsername.trim()) { setMsg("Username cannot be empty"); setMsgType("error"); return; }
    if (newUsername.trim() === user.username) return;
    const err = updateProfile({ username: newUsername.trim() });
    if (err) { setMsg(err); setMsgType("error"); } else { setMsg("Username updated!"); setMsgType("success"); }
  };

  const handlePasswordChange = () => {
    if (currentPassword !== user.password) { setMsg("Current password is incorrect"); setMsgType("error"); return; }
    if (newPassword.length < 6) { setMsg("New password must be at least 6 characters"); setMsgType("error"); return; }
    if (newPassword !== confirmPassword) { setMsg("Passwords do not match"); setMsgType("error"); return; }
    const err = updateProfile({ password: newPassword });
    if (err) { setMsg(err); setMsgType("error"); } else {
      setMsg("Password changed!");
      setMsgType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg("Image must be under 2MB"); setMsgType("error"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ profilePicture: reader.result as string });
      setMsg("Profile picture updated!");
      setMsgType("success");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <h1 className="font-display text-lg font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="container max-w-lg py-8 space-y-6 animate-fade-in">
        {msg && (
          <div className={`rounded-lg p-3 text-sm ${msgType === "success" ? "bg-income/15 text-income" : "bg-expense/15 text-expense"}`}>
            {msg}
          </div>
        )}

        {/* Profile Picture */}
        <div className="glass-card p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/50 bg-secondary">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full premium-gradient text-primary-foreground shadow-lg"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
          </div>
          <div className="text-center">
            <p className="font-display text-lg font-semibold text-foreground">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Username */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-foreground">Change Username</h3>
          <Input
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="New username"
            className="bg-secondary/50 border-border/50 text-foreground"
          />
          <Button onClick={handleUsernameChange} className="premium-gradient text-primary-foreground font-semibold">
            <Check className="mr-1.5 h-4 w-4" /> Update Username
          </Button>
        </div>

        {/* Password */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-foreground">Change Password</h3>
          <Input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="bg-secondary/50 border-border/50 text-foreground"
          />
          <Input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password"
            className="bg-secondary/50 border-border/50 text-foreground"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="bg-secondary/50 border-border/50 text-foreground"
          />
          <Button onClick={handlePasswordChange} className="premium-gradient text-primary-foreground font-semibold">
            <Check className="mr-1.5 h-4 w-4" /> Change Password
          </Button>
        </div>

        {/* Logout */}
        <Button variant="outline" className="w-full border-expense/30 text-expense hover:bg-expense/10" onClick={() => { logout(); navigate("/"); }}>
          Log Out
        </Button>
      </main>
    </div>
  );
};

export default ProfilePage;
