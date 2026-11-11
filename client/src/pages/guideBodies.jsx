import { useState } from 'react';
import { Check, CheckSquare, TriangleAlert } from 'lucide-react';
import { FaqList } from '../components/ui';
import { guideBySlug } from '../content/guides';

function Sec({ id, n, title, children }) {
  return (
    <section id={id} className="gsec" aria-labelledby={`${id}-h`}>
      <p className="gsec__n">{n}</p>
      <h2 id={`${id}-h`}>{title}</h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ITR basics                                                          */
/* ------------------------------------------------------------------ */

const WHO = [
  ['Salaried Individuals', 'Employees receiving salary income above the basic exemption limit must file.'],
  ['Freelancers', 'Freelancers and independent professionals must report their professional income.'],
  ['Business Owners', 'Must report business income, expenses and relevant financial information, even in loss.'],
  ['Capital Gains', 'If you sold shares, mutual funds or properties, these gains must be reported.'],
];

const BASIC_DOCS = [
  ['Form 16 & Salary Slips', 'Essential for salaried employees to verify TDS and allowances.'],
  ['Form 26AS & AIS', 'Extremely critical to check all taxes deducted and high-value transactions reported to the government.'],
  ['Bank Statements', 'For the period of 1st April to 31st March to calculate savings interest.'],
  ['Business Records', 'Invoices, expense receipts, and profit/loss statements if you run a business or freelance.'],
];

function Basics() {
  return (
    <>
      <Sec id="who-should-file" n="01" title="Who Should File an ITR?">
        <p>Many people think that ITR filing is only for salaried employees. That is not always the case. Your ITR requirement depends on your income, income sources and other applicable conditions.</p>
        <div className="ggrid ggrid--2">
          {WHO.map(([t, b]) => (
            <div key={t} className="gcell">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </Sec>
      <Sec id="documents-required" n="02" title="Crucial Documents Required">
        <p>The documents required depend on your income sources and the type of ITR applicable to you. You do not attach these to the return, but you need them for accurate filing.</p>
        <ul className="glist">
          {BASIC_DOCS.map(([k, v]) => (
            <li key={k}><Check size={18} strokeWidth={2} aria-hidden="true" /><span><strong>{k}:</strong> {v}</span></li>
          ))}
        </ul>
      </Sec>
      <Sec id="common-mistakes" n="03" title="Common Mistakes to Avoid">
        <p>A small mistake in your return can create unnecessary confusion or lead to a defective return notice.</p>
        <ul className="gbullets">
          <li>Selecting the wrong ITR Form based on your income type.</li>
          <li>Forgetting to declare savings bank account interest.</li>
          <li>Ignoring mismatches between your calculation and the AIS (Annual Information Statement).</li>
          <li>Failing to pre-validate your bank account for receiving refunds.</li>
        </ul>
      </Sec>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* ITR forms                                                           */
/* ------------------------------------------------------------------ */

const FORM_ROWS = [
  ['Salary Income', 'ITR-1 or ITR-2 (Depending on exact facts & limits)'],
  ['Capital Gains', 'ITR-2 (In applicable cases like shares/property sale)'],
  ['Business / Profession', 'ITR-3 or ITR-4 (Depending on specific eligibility)'],
  ['Presumptive Income', 'ITR-4 (Where eligible under sections 44AD/44ADA)'],
];

function Forms() {
  return (
    <Sec id="form-matrix" n="01" title="The Form Selection Matrix">
      <p>Depending on your income sources, here is a quick overview of which form might apply to your situation for the current Assessment Year.</p>
      <div className="gtable">
        <table>
          <thead>
            <tr>
              <th scope="col">Your Situation / Income Source</th>
              <th scope="col">Possible ITR Form</th>
            </tr>
          </thead>
          <tbody>
            {FORM_ROWS.map(([k, v]) => (
              <tr key={k}>
                <th scope="row">{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="gnote">
        <TriangleAlert size={22} strokeWidth={1.5} aria-hidden="true" />
        <div>
          <strong>Important: No Absolute Rules</strong>
          <p>According to the current guidance of the Income Tax Department (Income Tax India), ITR form eligibility depends entirely on your exact income type, residential status, and other strict conditions. The above matrix is a general indicator. You must always update your selection based on the current Assessment Year (AY) rules.</p>
        </div>
      </aside>
    </Sec>
  );
}

/* ------------------------------------------------------------------ */
/* ITR documents                                                       */
/* ------------------------------------------------------------------ */

const KYC = [
  ['PAN Card', 'Must be active and linked.'],
  ['Aadhaar Card', 'Mandatory to verify the return.'],
  ['Bank Details', 'Pre-validated account for refunds.'],
];

const PROFILES = [
  {
    id: 'salaried',
    title: "If you're a Salaried Person",
    items: [
      ['Form 16 (Part A & B)', 'Provided by your employer showing TDS and salary breakdown.'],
      ['Form 26AS & AIS', 'Crucial to verify that your employer actually deposited your TDS.'],
      ['Investment Proofs (80C etc.)', 'LIC, PPF, ELSS statements if you opted for the Old Tax Regime.'],
      ['Rent Receipts', 'Required to claim HRA (House Rent Allowance) exemption.'],
    ],
  },
  {
    id: 'business',
    title: "If you're a Business Owner (MSME/Trader)",
    items: [
      ['Sales & Purchase Details', 'Total aggregate turnover and input costs for the financial year.'],
      ['Bank Statements', 'From April 1 to March 31 (for all current and savings accounts).'],
      ['GST Returns Data', 'Monthly/Quarterly GSTR-1 and 3B details to match with income.'],
      ['Books of Accounts / Previous ITR', "P&L, Balance Sheet (if audited), or previous year's business ITR."],
    ],
  },
  {
    id: 'freelancer',
    title: "If you're a Freelancer / Consultant",
    items: [
      ['Invoices Raised', 'Summary of all professional invoices issued during the year.'],
      ['Form 26AS (Very Important)', 'To check the 10% TDS deducted by clients under section 194J.'],
      ['FIRC / PayPal Statements', 'If you have foreign clients, these act as proof of inward remittance.'],
      ['Business Expenses', 'Internet bills, software subscriptions, and laptop depreciation bills.'],
    ],
  },
];

function CheckCard({ profile }) {
  const [done, setDone] = useState({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <div className="gcheck">
      <div className="gcheck__head">
        <h3>{profile.title}</h3>
        <p aria-live="polite">{count}/{profile.items.length}</p>
      </div>
      <ul>
        {profile.items.map(([k, v]) => {
          const id = `${profile.id}-${k}`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
          return (
            <li key={k}>
              <input
                id={id}
                type="checkbox"
                checked={Boolean(done[k])}
                onChange={(e) => setDone((d) => ({ ...d, [k]: e.target.checked }))}
              />
              <label htmlFor={id}>
                <strong>{k}</strong>
                <span>{v}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Documents() {
  return (
    <>
      <Sec id="base-kyc" n="01" title="The Non-Negotiables (Base KYC)">
        <p>Before jumping into your specific income type, make sure you have these three fundamental documents ready. These are required for <strong>every single taxpayer</strong> in India.</p>
        <div className="ggrid ggrid--3">
          {KYC.map(([t, b]) => (
            <div key={t} className="gcell">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </Sec>
      <Sec id="profile-checklists" n="02" title="Profile-Specific Checklists">
        <p>Select your primary source of income below to see the exact documents you need to hand over to your tax consultant.</p>
        {PROFILES.map((p) => <CheckCard key={p.id} profile={p} />)}
      </Sec>
      <Sec id="other-income" n="03" title="Other Income Sources (Don't Miss These!)">
        <p>Tax notices often arrive because people forget to declare secondary income. Check if any of these apply to you:</p>
        <div className="ginfo">
          <h3>Capital Gains (Stocks &amp; Crypto)</h3>
          <p>If you trade in stocks, mutual funds, or Crypto, you must download the <strong>Tax P&amp;L Statement</strong> from your broker (Zerodha, Groww, Upstox, etc.).</p>
        </div>
        <div className="ginfo">
          <h3>Rental Income &amp; Property Sale</h3>
          <p>Keep your Rent Agreement, Municipal Tax receipts, and <strong>Home Loan Interest Certificate</strong> (to claim Section 24 deduction). For property sales, keep the Sale Deed handy.</p>
        </div>
        <div className="ginfo">
          <h3>Bank Interest &amp; Foreign Assets</h3>
          <p>Interest certificates for your FDs and Savings accounts. If you work in an MNC and get foreign shares (RSUs/ESPPs) or have foreign bank accounts, this <strong>must</strong> be declared in schedule FA.</p>
        </div>
      </Sec>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* AIS / 26AS / Form 16                                                */
/* ------------------------------------------------------------------ */

const PILLARS = [
  {
    t: 'Form 16',
    b: 'A TDS certificate issued directly by your employer. If you are salaried and TDS is deducted, you receive this.',
    l: ['Salary paid', 'Tax deducted', 'Exemptions claimed'],
  },
  {
    t: 'Form 26AS',
    b: 'A tax passbook available on the e-Filing portal showing mainly TDS and TCS reported by deductors.',
    l: ['Employer TDS', 'Bank TDS', 'TCS collected'],
  },
  {
    t: 'AIS',
    b: 'The Annual Information Statement. It provides a massive, 360-degree view of your financial footprint.',
    l: ['Interest & Dividends', 'Stock market data', 'Property transactions'],
  },
];

const COMPARE = [
  ['Form 16', 'Salary details and TDS deducted by your employer.', 'Your Employer'],
  ['Form 26AS', 'Mainly TDS and TCS-related tax information.', 'Income Tax Department'],
  ['AIS', 'Broader financial and tax-related information (Stocks, Interest, Property).', 'Income Tax Department'],
];

const CHECK_A = ['Form 16 Salary Details', 'TDS Deducted (Form 16)', 'Form 26AS Tax Credits', 'AIS Verification'];
const CHECK_B = ['Bank FD/SB Interest', 'Dividend Income', 'Stock Capital Gains', 'Rental Income'];

function Comparison() {
  const g = guideBySlug('itr-comparison');
  return (
    <>
      <Sec id="three-pillars" n="01" title="The 3 Tax Pillars Explained">
        <p>All three documents contain tax-related information, but they serve completely different purposes and originate from different sources.</p>
        <div className="ggrid ggrid--3">
          {PILLARS.map((p) => (
            <div key={p.t} className="gpillar">
              <h3>{p.t}</h3>
              <p>{p.b}</p>
              <ul>
                {p.l.map((x) => <li key={x}><Check size={15} strokeWidth={2} aria-hidden="true" />{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Sec>

      <Sec id="at-a-glance" n="02" title="The Difference at a Glance">
        <div className="gtable">
          <table>
            <thead>
              <tr>
                <th scope="col">Document</th>
                <th scope="col">What It Mainly Shows</th>
                <th scope="col">Where It Comes From</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([a, b, c]) => (
                <tr key={a}>
                  <th scope="row">{a}</th>
                  <td>{b}</td>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="grule">Rule of Thumb: Form 16 = Salary | Form 26AS = Tax Credits | AIS = All Financial Activity</p>
      </Sec>

      <Sec id="mismatch" n="03" title="What If There is a Mismatch?">
        <p>One of the most crucial steps before filing your ITR is to review and reconcile your information. Do not simply copy every figure from one document without checking it against your actual records.</p>
        <h3 className="gsub">{g.howTo.name}</h3>
        <p>Suppose your AIS shows interest income of ₹50,000, but your actual bank records show ₹42,000. Do not ignore the difference, and do not immediately assume AIS is correct. Follow these steps:</p>
        <ol className="gsteps">
          {g.howTo.steps.map(([t, b], i) => (
            <li key={t}>
              <span className="gsteps__n">{i + 1}</span>
              <div>
                <strong>{t}</strong>
                <p>{b}</p>
              </div>
            </li>
          ))}
        </ol>
      </Sec>

      <aside className="gcase">
        <h3>A Simple Example: Rahul's ITR</h3>
        <p>Let's take the example of Rahul, a salaried employee who also trades stocks and has FDs.</p>
        <ul>
          <li><strong>In Form 16:</strong> Rahul checks his exact Salary and the TDS deducted by his HR.</li>
          <li><strong>In Form 26AS:</strong> He verifies that his employer actually deposited that TDS to the government.</li>
          <li><strong>In AIS:</strong> He discovers ₹15,000 Bank Interest and ₹40,000 Capital Gains from his stock broker, which he must add to his ITR to avoid notices.</li>
        </ul>
      </aside>

      <Sec id="pre-filing" n="04" title="The Pre-Filing Review Checklist">
        <p>Before hitting that submit button on the tax portal, ensure you have cross-verified the following:</p>
        <h3 className="gsub">Salary &amp; Tax Information</h3>
        <ul className="gchecks">
          {CHECK_A.map((c) => <li key={c}><CheckSquare size={17} strokeWidth={1.75} aria-hidden="true" />{c}</li>)}
        </ul>
        <h3 className="gsub">Other Income (Often Missed)</h3>
        <ul className="gchecks">
          {CHECK_B.map((c) => <li key={c}><CheckSquare size={17} strokeWidth={1.75} aria-hidden="true" />{c}</li>)}
        </ul>
        <aside className="gnote gnote--stamp">
          <TriangleAlert size={22} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <strong>Can You File ITR Using Only Form 16?</strong>
            <p>Not always! If you have bank interest, dividend income, or capital gains, you must consider all relevant information beyond Form 16 before filing.</p>
          </div>
        </aside>
      </Sec>

      <Sec id="faq" n="05" title="Frequently Asked Questions">
        <FaqList items={g.faqs} />
      </Sec>
    </>
  );
}

export const GUIDE_BODIES = {
  'itr-basics': Basics,
  'itr-forms': Forms,
  'itr-documents': Documents,
  'itr-comparison': Comparison,
};
