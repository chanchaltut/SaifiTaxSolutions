import Hero, { StatBand } from '../components/Hero';
import OurServices from '../components/OurServices';
import DueDatesSection, { ComplianceRadar } from '../components/DueDates';
import Certificates from '../components/Certificates';
import { FaqSection, Licences, NoticeDesk, Plans, Process, Reviews, Verticals } from '../components/Sections';
import { CheckerSection, EstimatorSection } from '../components/Tools';

/**
 * Follows the arrangement of the client's original site, with the
 * services marquee in the header:
 *
 * Hero → Our Services → Compliance Radar → Full-Lifecycle Business Governance
 * → Certificate Preview → ITR & Tax Checker → Compliance Plans → Reviews
 * → Numbers → How It Works → Notice Desk → Due Dates → Licences
 * → Presumptive Estimator → FAQ.
 *
 * The Knowledge Hub lives in the header, not on this page.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <OurServices />
      <ComplianceRadar />
      <Verticals />
      <Certificates />
      <CheckerSection />
      <Plans />
      <Reviews />
      <StatBand />
      <Process />
      <NoticeDesk />
      <DueDatesSection />
      <Licences />
      <EstimatorSection />
      <FaqSection />
    </>
  );
}
