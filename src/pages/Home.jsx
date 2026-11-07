import Hero, { Stats, Ticker } from '../components/Hero';
import Discovery from '../components/Discovery';
import DueDatesSection from '../components/DueDates';
import {
  FaqSection,
  FinalCta,
  HubTeaser,
  Licences,
  NoticeDesk,
  Plans,
  Process,
  Reviews,
  ServiceIndex,
  Verticals,
} from '../components/Sections';
import { CheckerSection, EstimatorSection } from '../components/Tools';

/**
 * Sequenced to the AIDA model:
 *
 * ATTENTION  Hero promise, live statutory countdown, proof numbers.
 * INTEREST   "What applies to me?" Setup Engine, practice verticals, full service index.
 * DESIRE     How painless it is, who already trusts it, the plans, and what it saves.
 * ACTION     Urgent triggers (notices, due dates), objections answered, then one clear ask.
 */
export default function Home() {
  return (
    <>
      {/* ATTENTION */}
      <Hero />
      <Ticker />
      <section className="statband" aria-label="Saifi Tax Solutions in numbers">
        <div className="wrap"><Stats /></div>
      </section>

      {/* INTEREST */}
      <Discovery />
      <Verticals />
      <ServiceIndex />

      {/* DESIRE */}
      <Process />
      <Reviews />
      <Plans />
      <CheckerSection />
      <EstimatorSection />

      {/* ACTION */}
      <NoticeDesk />
      <DueDatesSection />
      <Licences />
      <FaqSection />
      <HubTeaser />
      <FinalCta />
    </>
  );
}
