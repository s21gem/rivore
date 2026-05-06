const fs = require('fs');
const file = 'c:/Users/hp/Downloads/rivore-main/rivore-main/src/pages/admin/Settings.tsx';
const content = fs.readFileSync(file, 'utf8').split('\n');
const before = content.slice(0, 25);
const after = content.slice(424);
const replacement = `// ========== Security Credential Change Component ==========
function SecurityCredentialSection({ token }: { token: string | null }) {
  const [hasEmail, setHasEmail] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const [mode, setMode] = useState<'loading' | 'setup-email' | 'menu' | 'change-email' | 'change-credentials'>('loading');
  const [step, setStep] = useState<number>(1);
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Form Inputs
  const [emailInput, setEmailInput] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` };

  useEffect(() => {
    fetch('/api/auth/admin-email', { headers })
      .then(res => res.json())
      .then(data => {
        setHasEmail(data.hasEmail);
        setAdminEmail(data.email);
        setMode(data.hasEmail ? 'menu' : 'setup-email');
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const resetState = () => {
    setStep(1);
    setOtp('');
    setEmailInput('');
    setNewUsername('');
    setNewPassword('');
    setMessage(null);
    setCountdown(0);
  };

  const handleModeChange = (newMode: typeof mode) => {
    resetState();
    setMode(newMode);
  };

  const formatTime = (s: number) => \`\${Math.floor(s / 60)}:\${String(s % 60).padStart(2, '0')}\`;

  // ================= ACTIONS ================= //

  const handleApiRequest = async (url: string, body?: any, onSuccess?: (data: any) => void) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(url, { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json();
      if (res.ok) {
        if (onSuccess) onSuccess(data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // --- FLOW: SETUP EMAIL ---
  const sendSetupOtp = () => {
    if (!emailInput || !/^[^\s@]+@[^\s@]+\\.[^\s@]+$/.test(emailInput)) return setMessage({ type: 'error', text: 'Valid email required' });
    handleApiRequest('/api/auth/security/setup/send-otp', { email: emailInput }, (data) => {
      setStep(2); setCountdown(300); setMessage({ type: 'success', text: data.message });
    });
  };

  const verifySetupOtp = () => {
    if (otp.length !== 6) return setMessage({ type: 'error', text: 'Enter 6-digit OTP' });
    handleApiRequest('/api/auth/security/setup/verify', { otp, email: emailInput }, (data) => {
      setMessage({ type: 'success', text: data.message });
      setHasEmail(true); setAdminEmail(emailInput.replace(/(.{2})(.*)(@.*)/, '$1***$3'));
      setTimeout(() => handleModeChange('menu'), 2000);
    });
  };

  // --- FLOW: CHANGE SECURITY EMAIL (DUAL OTP) ---
  const sendCurrentEmailOtp = () => {
    handleApiRequest('/api/auth/security/change/send-current', undefined, (data) => {
      setStep(2); setCountdown(300); setMessage({ type: 'success', text: data.message });
    });
  };

  const verifyCurrentEmailOtp = () => {
    if (otp.length !== 6) return setMessage({ type: 'error', text: 'Enter 6-digit OTP' });
    handleApiRequest('/api/auth/security/change/verify-current', { otp }, (data) => {
      setStep(3); setOtp(''); setCountdown(0); setMessage({ type: 'success', text: data.message });
    });
  };

  const sendNewEmailOtp = () => {
    if (!emailInput || !/^[^\s@]+@[^\s@]+\\.[^\s@]+$/.test(emailInput)) return setMessage({ type: 'error', text: 'Valid email required' });
    handleApiRequest('/api/auth/security/change/send-new', { email: emailInput }, (data) => {
      setStep(4); setCountdown(300); setMessage({ type: 'success', text: data.message });
    });
  };

  const verifyNewEmailOtp = () => {
    if (otp.length !== 6) return setMessage({ type: 'error', text: 'Enter 6-digit OTP' });
    handleApiRequest('/api/auth/security/change/verify-new', { otp, email: emailInput }, (data) => {
      setMessage({ type: 'success', text: data.message });
      setAdminEmail(emailInput.replace(/(.{2})(.*)(@.*)/, '$1***$3'));
      setTimeout(() => handleModeChange('menu'), 2000);
    });
  };

  // --- FLOW: CHANGE CREDENTIALS (USERNAME/PASSWORD) ---
  const sendCredOtp = () => {
    handleApiRequest('/api/auth/credentials/send-otp', undefined, (data) => {
      setStep(2); setCountdown(300); setMessage({ type: 'success', text: data.message });
    });
  };

  const changeCredentials = () => {
    if (!newUsername && !newPassword) return setMessage({ type: 'error', text: 'Enter a new username or password' });
    if (newPassword && newPassword.length < 6) return setMessage({ type: 'error', text: 'Password min 6 characters' });
    handleApiRequest('/api/auth/credentials/change', { otp, newEmail: newUsername || undefined, newPassword: newPassword || undefined }, (data) => {
      setMessage({ type: 'success', text: data.message });
      if (data.token) localStorage.setItem('admin_token', data.token);
      setTimeout(() => handleModeChange('menu'), 2000);
    });
  };

  // ================= RENDER ================= //
  if (mode === 'loading') return <div className="text-sm text-muted-foreground animate-pulse">Checking security status...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Admin Security Settings
        </h2>
        {mode !== 'menu' && hasEmail && (
          <button onClick={() => handleModeChange('menu')} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Menu
          </button>
        )}
      </div>

      {message && (
        <div className={\`p-4 rounded-xl text-sm font-medium flex items-center gap-2 \${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}\`}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      {/* RENDER: MENU */}
      {mode === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/10 border border-border p-6 rounded-2xl space-y-3 hover:bg-muted/20 transition-colors">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Security Email</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              Current: <strong className="text-foreground">{adminEmail}</strong>. This email is used exclusively to receive OTP verification codes.
            </p>
            <button onClick={() => handleModeChange('change-email')} className="mt-2 text-primary font-medium text-sm hover:underline">
              Change Security Email →
            </button>
          </div>

          <div className="bg-muted/10 border border-border p-6 rounded-2xl space-y-3 hover:bg-muted/20 transition-colors">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Login Credentials</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              Change the Username and Password used to log into this admin dashboard. Requires OTP verification.
            </p>
            <button onClick={() => handleModeChange('change-credentials')} className="mt-2 text-primary font-medium text-sm hover:underline">
              Change Login Credentials →
            </button>
          </div>
        </div>
      )}

      {/* RENDER: SETUP EMAIL */}
      {mode === 'setup-email' && (
        <div className="bg-muted/10 p-6 rounded-2xl border border-border max-w-md space-y-5">
          <h3 className="font-semibold text-foreground">Setup Security Email</h3>
          <p className="text-sm text-muted-foreground">You must set up a security email to receive OTPs before you can change your login credentials.</p>
          
          {step === 1 && (
            <div className="space-y-4">
              <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="security@example.com" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
              <button onClick={sendSetupOtp} disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-medium">{loading ? 'Sending...' : 'Send OTP'}</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm">Enter the OTP sent to <strong>{emailInput}</strong> {countdown > 0 && <span className="text-primary">({formatTime(countdown)})</span>}</p>
              <div className="flex gap-2">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))} placeholder="______" className="flex-1 px-4 py-3 rounded-xl border border-border text-center tracking-widest font-mono text-xl outline-none" />
                <button onClick={verifySetupOtp} disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-medium">{loading ? '...' : 'Verify'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER: CHANGE SECURITY EMAIL (DUAL OTP) */}
      {mode === 'change-email' && (
        <div className="bg-muted/10 p-6 rounded-2xl border border-border max-w-lg space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-semibold text-lg text-foreground">Change Security Email</h3>
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Dual Verification</span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Step 1: Verify your <strong>current</strong> security email ({adminEmail}).</p>
              <button onClick={sendCurrentEmailOtp} disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-medium w-full sm:w-auto">{loading ? 'Sending...' : 'Send OTP to Current Email'}</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Step 1: Enter the OTP sent to <strong>{adminEmail}</strong> {countdown > 0 && <span className="text-primary">({formatTime(countdown)})</span>}</p>
              <div className="flex gap-2">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))} placeholder="______" className="flex-1 max-w-[200px] px-4 py-3 rounded-xl border border-border text-center tracking-widest font-mono text-xl outline-none" />
                <button onClick={verifyCurrentEmailOtp} disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-medium">{loading ? '...' : 'Verify'}</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm mb-4">✓ Current email verified.</div>
              <p className="text-sm text-muted-foreground">Step 2: Enter your <strong>new</strong> security email.</p>
              <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="new-security@example.com" className="w-full max-w-[300px] px-4 py-3 rounded-xl border border-border outline-none block" />
              <button onClick={sendNewEmailOtp} disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-medium mt-3">{loading ? 'Sending...' : 'Send OTP to New Email'}</button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Step 2: Enter the OTP sent to <strong>{emailInput}</strong> {countdown > 0 && <span className="text-primary">({formatTime(countdown)})</span>}</p>
              <div className="flex gap-2">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))} placeholder="______" className="flex-1 max-w-[200px] px-4 py-3 rounded-xl border border-border text-center tracking-widest font-mono text-xl outline-none" />
                <button onClick={verifyNewEmailOtp} disabled={loading} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium">{loading ? '...' : 'Confirm Change'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER: CHANGE LOGIN CREDENTIALS */}
      {mode === 'change-credentials' && (
        <div className="bg-muted/10 p-6 rounded-2xl border border-border max-w-lg space-y-5">
          <h3 className="font-semibold text-lg text-foreground mb-4">Change Login Credentials</h3>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">To change your login Username or Password, you must verify your identity via your security email ({adminEmail}).</p>
              <button onClick={sendCredOtp} disabled={loading} className="bg-primary text-white px-6 py-3 rounded-xl font-medium">{loading ? 'Sending...' : 'Send Verification OTP'}</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter the OTP sent to <strong>{adminEmail}</strong> {countdown > 0 && <span className="text-primary">({formatTime(countdown)})</span>}</p>
              
              {/* OTP Field */}
              <div className="mb-6">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))} placeholder="______" className="w-full max-w-[200px] px-4 py-3 rounded-xl border border-border text-center tracking-widest font-mono text-xl outline-none" />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-sm font-medium text-foreground">New Credentials (leave blank to keep current):</p>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">New Username</label>
                  <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="New username..." className="w-full px-4 py-3 rounded-xl border border-border outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">New Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 chars..." className="w-full px-4 py-3 pr-10 rounded-xl border border-border outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button onClick={changeCredentials} disabled={loading || otp.length !== 6 || (!newUsername && !newPassword)} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save New Credentials'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`;
const newContent = [...before, replacement, ...after].join('\n');
fs.writeFileSync(file, newContent, 'utf8');
console.log('Successfully replaced Settings.tsx UI');
