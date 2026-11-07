import { Route, Switch } from 'wouter';
import Layout from './components/Layout';
import Home from './pages/Home';
import { ServicesPage, ServiceCategoryPage, FeeSchedulePage } from './pages/ServicePages';
import { ToolsHubPage, ToolPage } from './pages/ToolPages';
import { AboutPage, CalendarPage, ContactPage, FaqPage, NoticeDeskPage, NotFoundPage } from './pages/InfoPages';
import { GuidePage, KnowledgeHubPage } from './pages/KnowledgePages';

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/services/:slug" component={ServiceCategoryPage} />
        <Route path="/fee-schedule" component={FeeSchedulePage} />
        <Route path="/tools" component={ToolsHubPage} />
        <Route path="/tools/gst-calculator"><ToolPage id="gst" /></Route>
        <Route path="/tools/emi-calculator"><ToolPage id="emi" /></Route>
        <Route path="/tools/presumptive-tax-estimator"><ToolPage id="estimator" /></Route>
        <Route path="/tools/itr-checker"><ToolPage id="checker" /></Route>
        <Route path="/compliance-calendar" component={CalendarPage} />
        <Route path="/notice-desk" component={NoticeDeskPage} />
        <Route path="/knowledge-hub" component={KnowledgeHubPage} />
        <Route path="/knowledge-hub/:slug" component={GuidePage} />
        <Route path="/faq" component={FaqPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Layout>
  );
}
