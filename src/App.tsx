declare global { interface Window { ethereum?: any; } }
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const PRIVAPAY_ABI = [
  "function employer() view returns (address)",
  "function isEmployee(address) view returns (bool)",
  "function isHRAdmin(address) view returns (bool)",
  "function employeeCount() view returns (uint256)",
  "function currentPeriod() view returns (uint256)",
  "function paused() view returns (bool)",
  "function canClaim(address) view returns (bool)",
  "function lastClaimedPeriod(address) view returns (uint256)",
  "function addEmployee(address) external",
  "function removeEmployee(address) external",
  "function addHRAdmin(address) external",
  "function claimSalary() external",
  "function advancePeriod() external",
  "function pause() external",
  "function unpause() external",
  "function requestAuditReveal() external",
  "function getSalary(address) view returns (bytes32)",
  "event EmployeeAdded(address indexed employee)",
  "event SalarySet(address indexed employee)",
  "event SalaryClaimed(address indexed employee, uint256 period)",
  "event PeriodAdvanced(uint256 newPeriod)",
];

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5908c013b2E73f9bc1dE49aCA31974c8D708f9E1";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=DM+Mono:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #f7f4ef;
    --white:   #ffffff;
    --black:   #111111;
    --border:  #e2ddd6;
    --muted:   #888278;
    --accent:  #1a6b3c;
    --accent2: #2d9b5a;
    --danger:  #c0392b;
    --serif:   'Newsreader', Georgia, serif;
    --mono:    'DM Mono', monospace;
    --sans:    'DM Sans', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--black);
    font-family: var(--sans);
    font-weight: 300;
    min-height: 100vh;
  }

  .app { max-width: 1080px; margin: 0 auto; padding: 0 32px 80px; }

  /* ── HEADER ── */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 0 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 48px;
  }
  .logo {
    font-family: var(--serif); font-size: 24px; font-weight: 400;
    letter-spacing: -0.5px; color: var(--black);
  }
  .logo em { font-style: italic; color: var(--accent); }
  .logo-sub {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;
  }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .network-pill {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    letter-spacing: 1px; text-transform: uppercase;
    padding: 6px 14px; border: 1px solid var(--border);
    border-radius: 999px;
  }
  .network-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
  .wallet-btn {
    font-family: var(--mono); font-size: 11px; letter-spacing: 1px;
    text-transform: uppercase; padding: 10px 20px;
    background: var(--black); color: var(--white);
    border: none; cursor: pointer; transition: background .2s;
  }
  .wallet-btn:hover { background: var(--accent); }
  .wallet-addr {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    letter-spacing: 1px; padding: 10px 16px;
    border: 1px solid var(--border);
  }

  /* ── TABS ── */
  .tabs {
    display: flex; border-bottom: 1px solid var(--border);
    margin-bottom: 40px;
  }
  .tab {
    font-family: var(--serif); font-size: 16px; font-style: italic;
    padding: 12px 0; margin-right: 32px;
    border: none; background: none; cursor: pointer;
    color: var(--muted); border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: color .2s, border-color .2s;
  }
  .tab.active { color: var(--black); border-bottom-color: var(--black); }
  .tab:hover:not(.active) { color: var(--black); }

  /* ── STATS ── */
  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border: 1px solid var(--border); margin-bottom: 40px;
    background: var(--border); gap: 1px;
  }
  .stat { background: var(--white); padding: 24px 20px; }
  .stat-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted); margin-bottom: 10px;
  }
  .stat-value {
    font-family: var(--serif); font-size: 28px; font-weight: 400;
    letter-spacing: -0.5px; line-height: 1;
  }
  .stat-value.green { color: var(--accent); }
  .stat-value.red { color: var(--danger); }
  .enc-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--accent);
    border: 1px solid var(--accent); padding: 4px 10px;
    margin-top: 4px;
  }
  .enc-dot-green {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent); animation: blink 2s infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

  /* ── ALERT ── */
  .alert {
    padding: 14px 18px; font-family: var(--mono); font-size: 11px;
    letter-spacing: .5px; margin-bottom: 24px;
    border-left: 3px solid;
  }
  .alert-warn { background: #fff8ee; border-color: #e8a44a; color: #8a5a00; }
  .alert-info { background: #eef7f1; border-color: var(--accent); color: var(--accent); }
  .alert-danger { background: #fdf0ef; border-color: var(--danger); color: var(--danger); }

  /* ── PANELS ── */
  .panel { background: var(--white); border: 1px solid var(--border); margin-bottom: 16px; }
  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid var(--border);
  }
  .panel-title {
    font-family: var(--serif); font-size: 15px; font-style: italic;
    color: var(--black);
  }
  .panel-body { padding: 24px; }

  /* ── FORM ── */
  .field-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 200px; }
  .field label {
    font-family: var(--mono); font-size: 9px; color: var(--muted);
    letter-spacing: 2px; text-transform: uppercase;
  }
  .field input {
    background: var(--bg); border: 1px solid var(--border);
    color: var(--black); font-family: var(--mono); font-size: 12px;
    padding: 10px 14px; outline: none; transition: border-color .2s;
    border-radius: 0;
  }
  .field input:focus { border-color: var(--black); }
  .field input::placeholder { color: var(--muted); }

  /* ── BUTTONS ── */
  .btn {
    font-family: var(--mono); font-size: 11px; letter-spacing: 1px;
    text-transform: uppercase; padding: 10px 22px;
    border: none; cursor: pointer; transition: all .15s; white-space: nowrap;
  }
  .btn-black { background: var(--black); color: var(--white); }
  .btn-black:hover { background: var(--accent); }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--muted); }
  .btn-outline:hover { border-color: var(--black); color: var(--black); }
  .btn-danger-outline { background: transparent; border: 1px solid var(--danger); color: var(--danger); }
  .btn-danger-outline:hover { background: var(--danger); color: var(--white); }
  .btn-green { background: var(--accent); color: var(--white); }
  .btn-green:hover { background: #155c32; }
  .btn:disabled { opacity: .4; cursor: not-allowed; }
  .btn-lg { padding: 14px 32px; font-size: 13px; }

  /* ── EMPLOYEE LIST ── */
  .emp-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); }
  .emp-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--white); padding: 14px 20px;
    transition: background .15s;
  }
  .emp-row:hover { background: var(--bg); }
  .emp-addr { font-family: var(--mono); font-size: 12px; }
  .badge {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 3px 10px; border: 1px solid;
  }
  .badge-claimed { color: var(--accent); border-color: var(--accent); background: #eef7f1; }
  .badge-pending { color: var(--muted); border-color: var(--border); }

  /* ── CLAIM HERO ── */
  .claim-center { text-align: center; padding: 60px 24px; }
  .claim-center h2 {
    font-family: var(--serif); font-size: 42px; font-weight: 400;
    font-style: italic; letter-spacing: -1px; margin-bottom: 12px;
  }
  .claim-center p { color: var(--muted); font-size: 15px; line-height: 1.7; max-width: 420px; margin: 0 auto 36px; }
  .claim-meta {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    letter-spacing: 1px; margin-top: 16px;
  }

  /* ── CODE BLOCK ── */
  .code-block {
    background: var(--bg); border: 1px solid var(--border);
    font-family: var(--mono); font-size: 11px; color: var(--accent);
    padding: 16px 20px; line-height: 1.8; overflow-x: auto;
    margin-top: 16px;
  }

  /* ── HISTORY ── */
  .hist-row { display: flex; gap: 32px; padding: 20px 0; border-bottom: 1px solid var(--border); }
  .hist-row:last-child { border-bottom: none; }
  .hist-key { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; width: 140px; flex-shrink: 0; padding-top: 2px; }
  .hist-val { font-family: var(--serif); font-size: 22px; letter-spacing: -0.3px; }
  .hist-val.green { color: var(--accent); }

  /* ── CONTROLS ROW ── */
  .controls-row { display: flex; gap: 12px; flex-wrap: wrap; }

  /* ── TOAST ── */
  .toasts { position: fixed; bottom: 28px; right: 28px; display: flex; flex-direction: column; gap: 10px; z-index: 999; }
  .toast {
    padding: 14px 20px; font-family: var(--mono); font-size: 11px;
    letter-spacing: .5px; max-width: 360px;
    border-left: 3px solid; background: var(--white);
    animation: toastIn .3s ease;
  }
  .toast-success { border-color: var(--accent); color: var(--accent); }
  .toast-error   { border-color: var(--danger); color: var(--danger); }
  .toast-info    { border-color: var(--black); color: var(--black); }
  @keyframes toastIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .empty { font-family: var(--serif); font-style: italic; color: var(--muted); font-size: 15px; }

  @media (max-width: 640px) {
    .stats { grid-template-columns: 1fr 1fr; }
    .app { padding: 0 16px 60px; }
  }
`;

function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const add = useCallback((msg: string, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);
  return { toasts, add };
}

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isEmp, setIsEmp] = useState(false);
  const [tab, setTab] = useState<"employer" | "employee">("employer");
  const [loading, setLoading] = useState(false);
  const { toasts, add: toast } = useToast();

  const [stats, setStats] = useState({ period: 0, empCount: 0, paused: false });
  const [employees, setEmployees] = useState<{ addr: string; claimed: boolean }[]>([]);
  const [newEmpAddr, setNewEmpAddr] = useState("");
  const [newHRAddr, setNewHRAddr] = useState("");
  const [salaryAddr, setSalaryAddr] = useState("");
  const [salaryAmt, setSalaryAmt] = useState("");
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimed, setLastClaimed] = useState(0);
  const [claiming, setClaiming] = useState(false);

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  async function connect() {
    if (!window.ethereum) { toast("MetaMask not found", "error"); return; }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    const c = new ethers.Contract(CONTRACT_ADDRESS, PRIVAPAY_ABI, signer);
    setAccount(addr);
    setContract(c);
    const employerAddr = await c.employer();
    const _isEmployer = employerAddr.toLowerCase() === addr.toLowerCase();
    const _isEmp = await c.isEmployee(addr);
    setIsEmployer(_isEmployer);
    setIsEmp(_isEmp);
    if (_isEmp && !_isEmployer) setTab("employee");
    toast(`Connected ${short(addr)}`, "success");
  }

  const loadStats = useCallback(async () => {
    if (!contract) return;
    try {
      const [period, empCount, paused] = await Promise.all([
        contract.currentPeriod(), contract.employeeCount(), contract.paused()
      ]);
      setStats({ period: Number(period), empCount: Number(empCount), paused });
    } catch {}
  }, [contract]);

  const loadEmployees = useCallback(async () => {
    if (!contract) return;
    try {
      const filter = contract.filters.EmployeeAdded();
      const events = await contract.queryFilter(filter, -10000);
      const period = Number(await contract.currentPeriod());
      const list = await Promise.all(events.map(async (e: any) => {
        const addr = e.args[0];
        const active = await contract.isEmployee(addr);
        if (!active) return null;
        const lc = Number(await contract.lastClaimedPeriod(addr));
        return { addr, claimed: lc >= period };
      }));
      setEmployees(list.filter(Boolean) as any);
    } catch {}
  }, [contract]);

  const loadClaimState = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const [cc, lc] = await Promise.all([contract.canClaim(account), contract.lastClaimedPeriod(account)]);
      setCanClaim(cc);
      setLastClaimed(Number(lc));
    } catch {}
  }, [contract, account]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === "employer") loadEmployees(); }, [tab, loadEmployees]);
  useEffect(() => { if (tab === "employee") loadClaimState(); }, [tab, loadClaimState]);

  async function addEmployee() {
    if (!ethers.isAddress(newEmpAddr)) { toast("Invalid address", "error"); return; }
    setLoading(true);
    try {
      const tx = await contract.addEmployee(newEmpAddr);
      await tx.wait();
      toast("Employee added", "success");
      setNewEmpAddr(""); loadEmployees(); loadStats();
    } catch (e: any) { toast(e.reason || "Failed", "error"); }
    setLoading(false);
  }

  async function addHR() {
    if (!ethers.isAddress(newHRAddr)) { toast("Invalid address", "error"); return; }
    setLoading(true);
    try {
      const tx = await contract.addHRAdmin(newHRAddr);
      await tx.wait();
      toast("HR Admin granted", "success");
      setNewHRAddr("");
    } catch (e: any) { toast(e.reason || "Failed", "error"); }
    setLoading(false);
  }

  async function setSalary() {
    if (!ethers.isAddress(salaryAddr) || !salaryAmt) { toast("Fill all fields", "error"); return; }
    setLoading(true);
    try {
      const { createInstance, SepoliaConfig } = await import("@zama-fhe/relayer-sdk");
      
      toast("Initializing FHE instance...", "info");
      const instance = await createInstance(SepoliaConfig);

      const contractAddress = await contract.getAddress();
      const userAddress = account!;

      // Encrypt the salary amount
      const input = instance.createEncryptedInput(contractAddress, userAddress);
      input.add64(BigInt(salaryAmt));
      const enc = await input.encrypt();

      toast("Submitting encrypted salary onchain...", "info");
      const tx = await contract.setSalary(
        salaryAddr,
        enc.handles[0],
        enc.inputProof
      );
      await tx.wait();

      toast("Salary encrypted and set onchain ✓", "success");
      setSalaryAddr("");
      setSalaryAmt("");
    } catch (e: any) {
      toast(e.reason || e.message || "Encryption failed", "error");
    }
    setLoading(false);
  }

  async function advancePeriod() {
    setLoading(true);
    try {
      const tx = await contract.advancePeriod();
      await tx.wait();
      toast(`Period advanced to #${stats.period + 1}`, "success");
      loadStats(); loadEmployees();
    } catch (e: any) { toast(e.reason || "Failed", "error"); }
    setLoading(false);
  }

  async function togglePause() {
    setLoading(true);
    try {
      const tx = stats.paused ? await contract.unpause() : await contract.pause();
      await tx.wait();
      toast(stats.paused ? "Payroll unpaused" : "Payroll paused", "success");
      loadStats();
    } catch (e: any) { toast(e.reason || "Failed", "error"); }
    setLoading(false);
  }

  async function requestAudit() {
    setLoading(true);
    try {
      const tx = await contract.requestAuditReveal();
      await tx.wait();
      toast("Audit reveal requested — decrypt total off-chain via Relayer SDK", "info");
    } catch (e: any) { toast(e.reason || "Failed", "error"); }
    setLoading(false);
  }

  async function claimSalary() {
    setClaiming(true);
    try {
      const tx = await contract.claimSalary();
      await tx.wait();
      toast("Salary claimed — decrypt your balance via Relayer SDK", "success");
      loadClaimState();
    } catch (e: any) { toast(e.reason || e.message || "Failed", "error"); }
    setClaiming(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* HEADER */}
        <header className="header">
          <div>
            <a href="/landing.html" style={{textDecoration:"none", color:"inherit"}}>
  <div className="logo">Priva<em>Pay</em></div>
</a>
            <div className="logo-sub">Confidential Payroll · FHEVM</div>
          </div>
          <div className="header-right">
            {account && (
              <div className="network-pill">
                <span className="network-dot" />
                Sepolia
              </div>
            )}
            {account ? (
              <div style={{display:"flex", alignItems:"center", gap:8}}>
  <div className="wallet-addr">{short(account)}{isEmployer ? " · Employer" : isEmp ? " · Employee" : ""}</div>
  <button className="btn btn-outline" onClick={() => { setAccount(null); setContract(null); }} style={{padding:"6px 14px", fontSize:11}}>Disconnect</button>
</div>
            ) : (
              <button className="wallet-btn" onClick={connect}>Connect Wallet</button>
            )}
          </div>
        </header>

        {!account && (
          <div style={{ textAlign: "center", padding: "120px 24px" }}>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 52, fontWeight: 400, fontStyle: "italic", letterSpacing: -2, marginBottom: 20 }}>
              Salaries that stay<br />between you and them.
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 40px" }}>
              PrivaPay encrypts every salary using Fully Homomorphic Encryption. 
              Only the employer and employee can decrypt their own amount. 
              Not validators, not colleagues — nobody.
            </p>
            <button className="btn btn-black btn-lg" onClick={connect}>Connect Wallet to Start</button>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 16, letterSpacing: 1 }}>
              Make sure MetaMask is on Sepolia testnet
            </p>
          </div>
        )}

        {account && (
          <>
            {/* STATS */}
            <div className="stats">
              <div className="stat">
                <div className="stat-label">Payroll Period</div>
                <div className="stat-value">#{stats.period}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Employees</div>
                <div className="stat-value">{stats.empCount}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Status</div>
                <div className={`stat-value ${stats.paused ? "red" : "green"}`}>
                  {stats.paused ? "Paused" : "Active"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Salary Data</div>
                <div className="enc-pill">
                  <span className="enc-dot-green" />
                  Encrypted
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="tabs">
              <button className={`tab ${tab === "employer" ? "active" : ""}`} onClick={() => setTab("employer")}>
                Employer Dashboard
              </button>
              <button className={`tab ${tab === "employee" ? "active" : ""}`} onClick={() => setTab("employee")}>
                Employee View
              </button>
            </div>

            {/* ── EMPLOYER ── */}
            {tab === "employer" && (
              <div>
                {stats.paused && (
                  <div className="alert alert-danger">Payroll is paused. Employees cannot claim salaries.</div>
                )}
                {!isEmployer && (
                  <div className="alert alert-warn">Your wallet is not the employer address for this contract.</div>
                )}

                {/* Add Employee */}
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">Add Employee</span>
                  </div>
                  <div className="panel-body">
                    <div className="field-row">
                      <div className="field">
                        <label>Wallet Address</label>
                        <input placeholder="0x..." value={newEmpAddr} onChange={e => setNewEmpAddr(e.target.value)} />
                      </div>
                      <button className="btn btn-black" onClick={addEmployee} disabled={loading || !isEmployer}>
                        Add Employee
                      </button>
                    </div>
                  </div>
                </div>

                {/* Set Salary */}
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">Set Encrypted Salary</span>
                    <div className="enc-pill"><span className="enc-dot-green" />FHE Encrypted</div>
                  </div>
                  <div className="panel-body">
                    <div className="alert alert-info">
                      Salary amounts are encrypted using FHE before being stored on-chain. Only the employer and the employee can decrypt their own salary.
                    </div>
                    <div className="field-row" style={{ marginTop: 16 }}>
                      <div className="field">
                        <label>Employee Address</label>
                        <input placeholder="0x..." value={salaryAddr} onChange={e => setSalaryAddr(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Monthly Salary (6 decimals)</label>
                        <input placeholder="e.g. 5000000000 = $5,000" value={salaryAmt} onChange={e => setSalaryAmt(e.target.value)} />
                      </div>
                      <button className="btn btn-black" onClick={setSalary} disabled={loading || !isEmployer}>
                        Encrypt & Set
                      </button>
                    </div>
                  </div>
                </div>

                {/* Employees */}
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">Employees — Period #{stats.period}</span>
                    <button className="btn btn-outline" onClick={loadEmployees}>Refresh</button>
                  </div>
                  <div className="panel-body">
                    {employees.length === 0 ? (
                      <p className="empty">No employees yet. Add one above.</p>
                    ) : (
                      <div className="emp-list">
                        {employees.map(e => (
                          <div className="emp-row" key={e.addr}>
                            <span className="emp-addr">{e.addr}</span>
                            <span className={`badge ${e.claimed ? "badge-claimed" : "badge-pending"}`}>
                              {e.claimed ? "Claimed" : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">Payroll Controls</span>
                  </div>
                  <div className="panel-body">
                    <div className="controls-row">
                      <button className="btn btn-black" onClick={advancePeriod} disabled={loading || !isEmployer}>
                        Advance Period →
                      </button>
                      <button
                        className={`btn ${stats.paused ? "btn-green" : "btn-danger-outline"}`}
                        onClick={togglePause} disabled={loading || !isEmployer}
                      >
                        {stats.paused ? "Unpause Payroll" : "Pause Payroll"}
                      </button>
                      <button className="btn btn-outline" onClick={requestAudit} disabled={loading || !isEmployer}>
                        Request Audit Reveal
                      </button>
                    </div>
                  </div>
                </div>

                {/* HR Admin */}
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">HR Admin Access</span>
                  </div>
                  <div className="panel-body">
                    <div className="field-row">
                      <div className="field">
                        <label>HR Admin Wallet Address</label>
                        <input placeholder="0x..." value={newHRAddr} onChange={e => setNewHRAddr(e.target.value)} />
                      </div>
                      <button className="btn btn-black" onClick={addHR} disabled={loading || !isEmployer}>
                        Grant HR Access
                      </button>
                    </div>
                    <p style={{ marginTop: 14, fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: .5 }}>
                      HR admins can add employees and verify salary bands without seeing exact amounts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── EMPLOYEE ── */}
            {tab === "employee" && (
              <div>
                {!isEmp ? (
                  <div className="alert alert-warn">
                    Your wallet is not registered as an employee. Ask your employer to add your address.
                  </div>
                ) : (
                  <>
                    <div className="panel">
                      <div className="panel-body">
                        <div className="claim-center">
                          <h2>Your salary is private.</h2>
                          <p>
                            Only you can decrypt your salary. No one else — including validators, 
                            colleagues, or blockchain explorers — can see your amount.
                          </p>
                          {stats.paused ? (
                            <div className="alert alert-danger">Payroll is currently paused by employer.</div>
                          ) : canClaim ? (
                            <>
                              <button
                                className="btn btn-black btn-lg"
                                onClick={claimSalary}
                                disabled={claiming}
                              >
                                {claiming ? "Claiming…" : `Claim Period #${stats.period} Salary`}
                              </button>
                              <p className="claim-meta">
                                Transaction emits SalaryClaimed event · Decrypt balance via Relayer SDK
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="alert alert-info" style={{ display: "inline-block", marginBottom: 16 }}>
                                ✓ Already claimed for period #{stats.period}
                              </div>
                              <p className="claim-meta">
                                Next claim available after employer advances the period.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="panel">
                      <div className="panel-head">
                        <span className="panel-title">Decrypt your balance</span>
                        <div className="enc-pill"><span className="enc-dot-green" />FHE Encrypted</div>
                      </div>
                      <div className="panel-body">
                        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
                          Your salary is stored as an FHE ciphertext. Use the Zama Relayer SDK to re-encrypt it under your personal key — the plaintext never leaves your device.
                        </p>
                        <div className="code-block">
{`const instance = await createInstance({ ... });
const { publicKey, privateKey } = instance.generateKeypair();
const sig = await signer.signTypedData(...eip712...);
const handle = await contract.getSalary(yourAddress);
const salary = await instance.reencrypt(
  handle, privateKey, publicKey,
  sig, contractAddress, yourAddress
);`}
                        </div>
                      </div>
                    </div>

                    <div className="panel">
                      <div className="panel-head">
                        <span className="panel-title">Claim history</span>
                      </div>
                      <div className="panel-body">
                        <div className="hist-row">
                          <div className="hist-key">Last Claimed</div>
                          <div className="hist-val">{lastClaimed === 0 ? "—" : `Period #${lastClaimed}`}</div>
                        </div>
                        <div className="hist-row">
                          <div className="hist-key">Current Period</div>
                          <div className="hist-val green">#{stats.period}</div>
                        </div>
                        <div className="hist-row">
                          <div className="hist-key">Status</div>
                          <div className="hist-val">{canClaim ? "Ready to claim" : "Claimed"}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* TOASTS */}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}