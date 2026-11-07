import { Link } from '../lib/router';
import { ArrowRight } from 'lucide-react';
import { PageHead } from '../components/ui';
import { FinalCta } from '../components/Sections';
import { CheckerWidget, EmiCalculator, EstimatorWidget, GstCalculator, ToolsNav } from '../components/Tools';
import { toolById, tools, toolsHub } from '../content/tools';

export function ToolsHubPage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], [toolsHub.label]]}
        eyebrow={toolsHub.label}
        title="Saifi Tools"
        body="GST Calculator, EMI Calculator, Presumptive Income Estimator and the 1-Minute ITR & Tax Checker."
      />
      <section className="section section--tight">
        <div className="wrap">
          <ul className="toolgrid">
            {tools.map((t, i) => (
              <li key={t.id}>
                <Link to={t.path} className="toolcard">
                  <span className="toolcard__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="toolcard__title">{t.title}</span>
                  <span className="toolcard__body">{t.blurb}</span>
                  <ArrowRight size={22} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li>
              <div className="toolcard toolcard--soon" aria-disabled="true">
                <span className="toolcard__n">{String(tools.length + 1).padStart(2, '0')}</span>
                <span className="toolcard__title">{toolsHub.soon}</span>
              </div>
            </li>
          </ul>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

const WIDGETS = {
  gst: GstCalculator,
  emi: EmiCalculator,
  estimator: EstimatorWidget,
  checker: CheckerWidget,
};

export function ToolPage({ id }) {
  const tool = toolById(id);
  const Widget = WIDGETS[id];
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], [toolsHub.label, '/tools/'], [tool.nav]]}
        eyebrow={toolsHub.label}
        title={tool.title}
        body={tool.blurb}
      />
      <section className="section section--tight">
        <div className="wrap">
          <div className="toollayout">
            <ToolsNav />
            <div className="toollayout__main">
              <Widget />
            </div>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
