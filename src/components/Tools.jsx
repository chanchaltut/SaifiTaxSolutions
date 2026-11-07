import { useMemo, useState } from 'react';
import { Link, useLocation } from '../lib/router';
import { ArrowLeft } from 'lucide-react';
import { Btn, Eyebrow, Heading } from './ui';
import { estimator, checker, recommend, tools, toolsHub } from '../content/tools';
import { wa } from '../content/site';

const inr = (n) => Math.round(n).toLocaleString('en-IN');

/* ------------------------------------------------------------------ */
/* GST calculator                                                      */
/* ------------------------------------------------------------------ */

const GST_RATES = [5, 12, 18, 28];

export function GstCalculator() {
  const [mode, setMode] = useState('exclusive');
  const [amount, setAmount] = useState('10000');
  const [rate, setRate] = useState(18);

  const { taxable, half, total, grand } = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const isInc = mode === 'inclusive';
    const taxableAmt = isInc ? amt / (1 + rate / 100) : amt;
    const grandAmt = isInc ? amt : amt + (amt * rate) / 100;
    const totalTax = grandAmt - taxableAmt;
    return { taxable: taxableAmt, half: totalTax / 2, total: totalTax, grand: grandAmt };
  }, [amount, mode, rate]);

  const share = () => {
    const typeText = mode === 'inclusive' ? 'Inclusive' : 'Exclusive';
    const msg = `*GST Calculation (${typeText})*\n\nEntered Amount: ₹${amount}\nGST Rate: ${rate}%\n*Taxable Base: ₹ ${inr(taxable)}*\n*Total GST: ₹ ${inr(total)}*\n*Final Value: ₹ ${inr(grand)}*`;
    window.open(wa(msg), '_blank', 'noopener');
  };

  return (
    <div className="calc">
      <div className="calc__inputs">
        <fieldset className="field">
          <legend className="field__label">Calculation Type</legend>
          <div className="seg seg--2">
            {[
              ['exclusive', 'Exclusive (Base + Tax)'],
              ['inclusive', 'Inclusive (Total incl. Tax)'],
            ].map(([v, l]) => (
              <label key={v} className={`seg__opt${mode === v ? ' is-active' : ''}`}>
                <input type="radio" name="gstType" value={v} checked={mode === v} onChange={() => setMode(v)} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label className="field__label" htmlFor="gst-amt">Transaction Amount (₹)</label>
          <input id="gst-amt" className="input input--lg" type="number" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <fieldset className="field">
          <legend className="field__label">Applicable Tax Rate</legend>
          <div className="seg seg--4">
            {GST_RATES.map((r) => (
              <label key={r} className={`seg__opt${rate === r ? ' is-active' : ''}`}>
                <input type="radio" name="gstRate" value={r} checked={rate === r} onChange={() => setRate(r)} />
                <span>{r}%</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="calc__out" aria-live="polite">
        <dl className="ledger">
          <div><dt>Taxable Amount</dt><dd>₹ {inr(taxable)}</dd></div>
          <div><dt>CGST ({rate / 2}%)</dt><dd>+ ₹ {inr(half)}</dd></div>
          <div><dt>SGST ({rate / 2}%)</dt><dd>+ ₹ {inr(half)}</dd></div>
          <div className="ledger__sub"><dt>Total GST</dt><dd>₹ {inr(total)}</dd></div>
        </dl>
        <div className="calc__total">
          <p>Total Final Value</p>
          <p className="calc__figure">₹ {inr(grand)}</p>
        </div>
        <Btn onClick={share} tone="white">Share</Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EMI calculator                                                      */
/* ------------------------------------------------------------------ */

export function EmiCalculator() {
  const [principal, setPrincipal] = useState('500000');
  const [annual, setAnnual] = useState('10.5');
  const [years, setYears] = useState('5');

  const { emi, interest, totalPay } = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const rA = parseFloat(annual) || 0;
    const y = parseFloat(years) || 0;
    if (!(p > 0 && rA > 0 && y > 0)) return { emi: 0, interest: 0, totalPay: 0 };
    const r = rA / 12 / 100;
    const n = y * 12;
    const e = (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    const tp = e * n;
    return { emi: e, interest: tp - p, totalPay: tp };
  }, [principal, annual, years]);

  return (
    <div className="calc">
      <div className="calc__inputs">
        <div className="field">
          <label className="field__label" htmlFor="emi-a">Loan Amount (₹)</label>
          <input id="emi-a" className="input input--lg" type="number" min="0" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="emi-r">Interest Rate (% p.a.)</label>
          <input id="emi-r" className="input input--lg" type="number" min="0" step="0.1" inputMode="decimal" value={annual} onChange={(e) => setAnnual(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="emi-y">Tenure (Years)</label>
          <input id="emi-y" className="input input--lg" type="number" min="0" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
      </div>

      <div className="calc__out" aria-live="polite">
        <div className="calc__total calc__total--top">
          <p>Monthly Installment</p>
          <p className="calc__figure">₹ {inr(emi)}</p>
        </div>
        <dl className="ledger">
          <div><dt>Total Interest</dt><dd>₹ {inr(interest)}</dd></div>
          <div><dt>Total Payment</dt><dd>₹ {inr(totalPay)}</dd></div>
        </dl>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Presumptive income estimator                                        */
/* ------------------------------------------------------------------ */

export function EstimatorWidget() {
  const [type, setType] = useState(estimator.options[0].value);
  const [turnoverRaw, setTurnoverRaw] = useState('1200000');

  const option = estimator.options.find((o) => o.value === type);
  const turnover = Math.max(0, parseFloat(turnoverRaw) || 0);
  const profit = Math.round(turnover * option.rate);
  const msg = `Hi Saifi Tax, I used your Presumptive Tax Estimator:\n• Category: ${option.sec}\n• Gross Receipts: ₹${turnover.toLocaleString('en-IN')}\n• Estimated Taxable Profit: ₹${profit.toLocaleString('en-IN')}\n\nPlease help me file my ITR-4 to claim this benefit.`;

  return (
    <div className="estim">
      <div className="estim__inputs">
        <fieldset className="field">
          <legend className="field__label">{estimator.categoryLabel}</legend>
          <div className="radiolist">
            {estimator.options.map((o) => (
              <label key={o.value} className={`radiolist__opt${type === o.value ? ' is-active' : ''}`}>
                <input type="radio" name="saifi-calc-type" value={o.value} checked={type === o.value} onChange={() => setType(o.value)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label className="field__label" htmlFor="saifi-calc-turnover">{estimator.turnoverLabel}</label>
          <input
            id="saifi-calc-turnover"
            className="input input--lg"
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 1200000"
            value={turnoverRaw}
            onChange={(e) => setTurnoverRaw(e.target.value)}
          />
        </div>
      </div>
      <div className="estim__out" aria-live="polite">
        <p className="estim__label">{estimator.resultLabel}</p>
        <p className="estim__figure">₹{profit.toLocaleString('en-IN')}</p>
        <p className="estim__note">
          {profit <= 1200000 ? (
            <>
              Under <strong>{option.sec}</strong>, only ₹{profit.toLocaleString('en-IN')} is treated as taxable profit — which may qualify for{' '}
              <strong>nil income tax</strong> under the New Tax Regime (Section 87A rebate applies to resident individuals with total taxable income up to ₹12 lakh). Eligibility, other income and presumptive turnover limits apply.
            </>
          ) : (
            <>
              Under <strong>{option.sec}</strong>, ₹{(turnover - profit).toLocaleString('en-IN')} is legally deducted as presumptive business expense without maintaining complex books.
            </>
          )}
        </p>
        <Btn href={wa(msg)} tone="white">{estimator.cta}</Btn>
      </div>
    </div>
  );
}

export function EstimatorSection() {
  return (
    <section id="saifi-quick-estimator" className="section estimator" aria-labelledby="estim-title">
      <div className="wrap">
        <div className="sechead" data-reveal>
          <div className="sechead__l">
            <Eyebrow>{estimator.eyebrow}</Eyebrow>
            <Heading id="estim-title" a={estimator.titleA} b={estimator.titleB} />
          </div>
          <p className="sechead__r lede">{estimator.body}</p>
        </div>
        <div data-reveal>
          <EstimatorWidget />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 1-minute ITR and tax checker                                        */
/* ------------------------------------------------------------------ */

const PROGRESS = ['33%', '66%', '100%'];

export function CheckerWidget() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const done = step === 3;

  const pick = (value) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    setStep(step + 1);
  };

  const reset = () => {
    setAnswers(['', '', '']);
    setStep(0);
  };

  if (done) {
    const rec = recommend(answers[0]);
    const msg = `Hi Saifi Tax Solutions, I completed the 1-Minute Tax Checker on your website:\n\n• Profile: ${answers[0]}\n• Annual Bracket: ${answers[1]}\n• Requirement: ${answers[2]}\n• System Match: ${rec.title}\n\nPlease guide me with the next steps.`;
    return (
      <div className="checker checker--result" aria-live="polite">
        <p className="checker__resulteyebrow">{checker.resultEyebrow}</p>
        <h3 className="checker__rectitle">{rec.title}</h3>
        <p className="checker__recdesc">{rec.desc}</p>
        <ul className="checker__pills">
          {answers.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="checker__actions">
          <Btn href={wa(msg)}>{checker.cta}</Btn>
          <button type="button" className="linkbtn" onClick={reset}>{checker.restart}</button>
        </div>
      </div>
    );
  }

  const current = checker.steps[step];
  return (
    <div className="checker">
      <div className="checker__progress">
        <p>Step {step + 1} of 3</p>
        <p>{PROGRESS[step]}</p>
      </div>
      <div className="checker__bar" aria-hidden="true">
        <span style={{ width: PROGRESS[step] }} />
      </div>
      <h3 className="checker__q">{current.q}</h3>
      <div className="checker__opts">
        {current.options.map((o) => (
          <button key={o.value} type="button" className="copt" onClick={() => pick(o.value)}>
            <span className="copt__title">{o.title}</span>
            <span className="copt__sub">{o.sub}</span>
          </button>
        ))}
      </div>
      {step > 0 && (
        <button type="button" className="linkbtn checker__back" onClick={() => setStep(step - 1)}>
          <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
          {checker.back}
        </button>
      )}
    </div>
  );
}

export function CheckerSection() {
  return (
    <section id="saifi-tax-quiz" className="section quiz tone-blue" aria-labelledby="quiz-title">
      <div className="wrap">
        <div className="split">
          <div className="split__head" data-reveal>
            <Eyebrow tone="inv">{checker.eyebrow}</Eyebrow>
            <h2 id="quiz-title" className="h h--3xl">
              {checker.titleA} <span className="h__accent h__accent--sky">{checker.titleB}</span>
            </h2>
            <p className="lede">{checker.body}</p>
          </div>
          <div data-reveal>
            <CheckerWidget />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tools navigation                                                    */
/* ------------------------------------------------------------------ */

export function ToolsNav() {
  const { pathname } = useLocation();
  return (
    <nav className="toolsnav" aria-label={toolsHub.label}>
      <ul>
        {tools.map((t, i) => (
          <li key={t.id}>
            <Link to={t.path} aria-current={pathname === t.path ? 'page' : undefined} className={pathname === t.path ? 'is-active' : ''}>
              <span className="toolsnav__n">{String(i + 1).padStart(2, '0')}</span>
              {t.nav}
            </Link>
          </li>
        ))}
        <li>
          <span className="toolsnav__soon" aria-disabled="true">
            <span className="toolsnav__n">{String(tools.length + 1).padStart(2, '0')}</span>
            {toolsHub.soon}
          </span>
        </li>
      </ul>
    </nav>
  );
}
