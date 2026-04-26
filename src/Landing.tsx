import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080808;
    --surface: #0f0f0f;
    --surface2: #161616;
    --border: #1f1f1f;
    --text: #f0f0f0;
    --muted: #666;
    --accent: #b8ff57;
    --mono: 'IBM Plex Mono', monospace;
    --sans: 'Syne', sans-serif;
  }

  .lp-body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* NAV */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px;
    background: rgba(8,8,8,.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .lp-logo { font-family: var(--sans); font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; cursor: pointer; }
  .lp-logo span { color: var(--accent); }
  .lp-nav-links { display: flex; gap: 36px; align-items: center; }
  .lp-nav-links a { font-size: 14px; font-weight: 500; color: var(--muted); text-decoration: none; transition: color .2s; }
  .lp-nav-links a:hover { color: var(--text); }
  .lp-nav-cta {
    background: var(--accent); color: #000;
    font-family: var(--sans); font-size: 14px; font-weight: 700;
    padding: 10px 24px; border-radius: 999px;
    border: none; cursor: pointer; transition: all .2s;
  }
  .lp-nav-cta:hover { opacity: .9; transform: scale(1.03); }

  /* HERO */
  .lp-hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 120px 24px 80px;
    position: relative; overflow: hidden;
  }
  .lp-hero::before {
    content: ''; position: absolute;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(184,255,87,.07) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -60%);
    pointer-events: none;
  }
  .lp-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(184,255,87,.1); border: 1px solid rgba(184,255,87,.2);
    color: var(--accent); font-family: var(--mono); font-size: 11px;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 6px 16px; border-radius: 999px; margin-bottom: 32px;
  }
  .lp-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: lp-pulse 2s infinite; }
  @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  .lp-h1 {
    font-size: clamp(52px, 9vw, 100px);
    font-weight: 800; letter-spacing: -4px; line-height: .95;
    margin-bottom: 28px;
  }
  .lp-h1 .acc { color: var(--accent); }
  .lp-sub {
    font-size: 18px; color: var(--muted); line-height: 1.7;
    max-width: 520px; margin: 0 auto 52px;
  }
  .lp-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; }
  .lp-btn-primary {
    background: var(--accent); color: #000;
    font-family: var(--sans); font-size: 15px; font-weight: 700;
    padding: 14px 36px; border-radius: 999px;
    border: none; cursor: pointer; transition: all .2s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .lp-btn-primary:hover { opacity: .9; transform: scale(1.03); }
  .lp-btn-secondary {
    background: transparent; color: var(--text);
    font-family: var(--sans); font-size: 15px; font-weight: 600;
    padding: 14px 32px; border-radius: 999px;
    border: 1px solid var(--border); cursor: pointer;
    text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
    transition: border-color .2s;
  }
  .lp-btn-secondary:hover { border-color: #444; }

  /* STATS */
  .lp-stats {
    display: flex; width: 100%; max-width: 900px;
    background: var(--border); gap: 1px;
    border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
  }
  .lp-stat { background: var(--surface); flex: 1; padding: 28px 20px; text-align: center; }
  .lp-stat-num { font-size: 30px; font-weight: 800; letter-spacing: -1px; margin-bottom: 6px; }
  .lp-stat-num.g { color: var(--accent); }
  .lp-stat-label { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }
  .lp-stat-sub { font-family: var(--mono); font-size: 10px; color: var(--accent); margin-top: 4px; }

  /* SECTIONS */
  .lp-section { padding: 100px 48px; border-top: 1px solid var(--border); }
  .lp-section-inner { max-width: 1100px; margin: 0 auto; }
  .lp-tag {
    font-family: var(--mono); font-size: 11px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--accent); margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .lp-tag::before { content: ''; width: 20px; height: 1px; background: var(--accent); }
  .lp-section-title { font-size: clamp(32px, 5vw, 56px); font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-bottom: 16px; }
  .lp-section-sub { font-size: 16px; color: var(--muted); line-height: 1.7; max-width: 500px; margin-bottom: 56px; }

  /* FEATURES GRID */
  .lp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
  .lp-card { background: var(--surface); padding: 36px 28px; transition: background .2s; }
  .lp-card:hover { background: var(--surface2); }
  .lp-card-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(184,255,87,.1); border: 1px solid rgba(184,255,87,.2); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 20px; }
  .lp-card-num { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 2px; margin-bottom: 10px; }
  .lp-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 10px; letter-spacing: -.3px; }
  .lp-card p { font-size: 13px; color: var(--muted); line-height: 1.7; }

  /* STEPS */
  .lp-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .lp-step { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px 22px; transition: border-color .2s; position: relative; overflow: hidden; }
  .lp-step:hover { border-color: rgba(184,255,87,.3); }
  .lp-step::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), transparent); opacity: 0; transition: opacity .2s; }
  .lp-step:hover::before { opacity: 1; }
  .lp-step-num { font-family: var(--mono); font-size: 10px; color: var(--accent); letter-spacing: 2px; margin-bottom: 14px; }
  .lp-step h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
  .lp-step p { font-size: 12px; color: var(--muted); line-height: 1.7; }
  .lp-code { margin-top: 14px; padding: 10px 12px; background: #0a0a0a; border: 1px solid var(--border); font-family: var(--mono); font-size: 10px; color: var(--accent); line-height: 1.8; border-radius: 6px; }

  /* CTA */
  .lp-cta { border-top: 1px solid var(--border); background: var(--surface); text-align: center; padding: 120px 48px; }
  .lp-cta h2 { font-size: clamp(36px, 6vw, 72px); font-weight: 800; letter-spacing: -2px; margin-bottom: 16px; }
  .lp-cta h2 span { color: var(--accent); }
  .lp-cta p { font-size: 16px; color: var(--muted); margin-bottom: 48px; }

  /* FOOTER */
  .lp-footer { border-top: 1px solid var(--border); padding: 40px 48px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
  .lp-footer-logo { font-size: 18px; font-weight: 700; }
  .lp-footer-logo span { color: var(--accent); }
  .lp-footer-links { display: flex; gap: 28px; }
  .lp-footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .2s; }
  .lp-footer-links a:hover { color: var(--text); }
  .lp-footer-addr { font-family: var(--mono); font-size: 10px; color: #333; }

  @media (max-width: 900px) {
    .lp-nav { padding: 16px 24px; }
    .lp-nav-links { display: none; }
    .lp-section { padding: 60px 24px; }
    .lp-grid { grid-template-columns: 1fr; }
    .lp-steps { grid-template-columns: 1fr 1fr; }
    .lp-stats { flex-wrap: wrap; }
    .lp-footer { padding: 32px 24px; flex-direction: column; align-items: flex-start; }
  }
`;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <div className="lp-body">

        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-logo" onClick={() => navigate('/')}>Priva<span>Pay</span></div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#why">Why FHE</a>
            <a href="https://sepolia.etherscan.io/address/0x5908c013b2E73f9bc1dE49aCA31974c8D708f9E1" target="_blank">Contract ↗</a>
          </div>
          <button className="lp-nav-cta" onClick={() => navigate('/app')}>Launch App →</button>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Live on Sepolia · Zama Developer Program Season 2
          </div>
          <h1 className="lp-h1">
            Payroll that<br />keeps salaries<br /><span className="acc">private.</span>
          </h1>
          <p className="lp-sub">
            The first fully confidential onchain payroll system.
            Salary amounts encrypted using FHE — only employers
            and employees can see their own numbers.
          </p>
          <div className="lp-actions">
            <button className="lp-btn-primary" onClick={() => navigate('/app')}>Launch App →</button>
            <a href="https://github.com/khoragee/privapay" target="_blank" className="lp-btn-secondary">View on GitHub ↗</a>
          </div>

          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-num g">FHE</div>
              <div className="lp-stat-label">Encryption</div>
              <div className="lp-stat-sub">Zama FHEVM v0.9</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">30/30</div>
              <div className="lp-stat-label">Tests Passing</div>
              <div className="lp-stat-sub">100% coverage</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num g">0</div>
              <div className="lp-stat-label">Bytes Exposed</div>
              <div className="lp-stat-sub">Fully encrypted</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">Live</div>
              <div className="lp-stat-label">Network</div>
              <div className="lp-stat-sub">Sepolia testnet</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="lp-section" id="features">
          <div className="lp-section-inner">
            <div className="lp-tag">Features</div>
            <h2 className="lp-section-title">Built for real<br />organisations.</h2>
            <p className="lp-section-sub">Every feature designed around the principle that salary data should never be public.</p>
            <div className="lp-grid">
              {[
                { icon: '🔒', num: '01', title: 'Encrypted Salaries', desc: 'All salary values stored as euint64 FHE ciphertexts. Mathematically indistinguishable from random noise to anyone without the key.' },
                { icon: '👤', num: '02', title: 'Per-Employee ACL', desc: "Zama's Access Control List ensures only the employer and relevant employee can decrypt their salary. Enforced cryptographically." },
                { icon: '📅', num: '03', title: 'Payroll Periods', desc: 'Employees claim once per period. Employers advance the cycle. Clean, auditable, and entirely onchain.' },
                { icon: '🔍', num: '04', title: 'HR Band Checks', desc: 'HR verifies salary compliance without seeing exact amounts. Result is an encrypted boolean — only HR can decrypt.' },
                { icon: '📊', num: '05', title: 'Encrypted Totals', desc: 'Total payroll tracked as an encrypted accumulator. Audit without exposing individual salaries.' },
                { icon: '⚡', num: '06', title: 'Batch Operations', desc: 'Set salaries for entire teams in one transaction. Emergency pause/unpause. Built for enterprise scale.' },
              ].map(f => (
                <div className="lp-card" key={f.num}>
                  <div className="lp-card-icon">{f.icon}</div>
                  <div className="lp-card-num">{f.num}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="lp-section" id="how" style={{ background: 'var(--surface)' }}>
          <div className="lp-section-inner">
            <div className="lp-tag">How It Works</div>
            <h2 className="lp-section-title">Four steps.<br />Zero leaks.</h2>
            <p className="lp-section-sub">Every step of the payroll flow happens with encrypted data.</p>
            <div className="lp-steps">
              {[
                { num: 'STEP 01', title: 'Employer encrypts salary', desc: 'Amount encrypted client-side with Zama Relayer SDK. ZKPoK generated alongside the ciphertext.', code: 'input.add64(salary)\nconst enc = await input.encrypt()\n// → handle + ZKPoK' },
                { num: 'STEP 02', title: 'Contract validates & stores', desc: 'FHE.fromExternal() validates the ZKPoK. ACL set so only employer + employee can access.', code: 'euint64 s = FHE.fromExternal(\n  encSalary, inputProof\n)\nFHE.allow(s, employee)' },
                { num: 'STEP 03', title: 'Employee claims salary', desc: "Employee calls claimSalary(). Encrypted amount added to accumulator. No plaintext ever emitted.", code: '_total = FHE.add(\n  _total,\n  _salary[employee]\n)' },
                { num: 'STEP 04', title: 'Employee decrypts privately', desc: "Relayer SDK re-encrypts balance under personal key. Plaintext never leaves the device.", code: 'const salary = await instance\n  .reencrypt(handle,\n   privateKey, sig...)' },
              ].map(s => (
                <div className="lp-step" key={s.num}>
                  <div className="lp-step-num">{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="lp-code">{s.code}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="lp-cta">
          <h2>Ready to run <span>confidential</span> payroll?</h2>
          <p>Connect your wallet and start on Sepolia testnet today.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="lp-btn-primary" onClick={() => navigate('/app')}>Launch App →</button>
            <a href="https://sepolia.etherscan.io/address/0x5908c013b2E73f9bc1dE49aCA31974c8D708f9E1" target="_blank" className="lp-btn-secondary">View Contract ↗</a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div>
            <div className="lp-footer-logo">Priva<span>Pay</span></div>
            <div className="lp-footer-addr" style={{ marginTop: 8 }}>0x5908c013b2E73f9bc1dE49aCA31974c8D708f9E1</div>
          </div>
          <div className="lp-footer-links">
            <a href="https://zama.ai" target="_blank">Zama Protocol</a>
            <a href="https://docs.zama.ai/fhevm" target="_blank">FHEVM Docs</a>
            <a href="https://github.com/khoragee/privapay" target="_blank">GitHub</a>
            <a href="https://sepolia.etherscan.io/address/0x5908c013b2E73f9bc1dE49aCA31974c8D708f9E1" target="_blank">Etherscan</a>
          </div>
          <div className="lp-footer-addr">© 2026 PrivaPay · Zama Season 2</div>
        </footer>

      </div>
    </>
  );
}
