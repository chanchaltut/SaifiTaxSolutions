import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { ext } from './ui';
import { categories } from '../content/services';
import { SITE, wa } from '../content/site';
import { trackLead } from '../lib/analytics';

/** Sends the visitor's details straight to the firm's WhatsApp. Nothing is stored on this site. */
export default function EnquiryForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const lines = [
      `Hi Saifi Tax Solutions, I need help with ${service}.`,
      '',
      `Name: ${name.trim()}`,
      ...(city.trim() ? [`City: ${city.trim()}`] : []),
      ...(phone.trim() ? [`Please call me back on: ${phone.trim()}`] : []),
    ];
    trackLead('enquiry_form', service);
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
  };

  return (
    <form className="enq" onSubmit={submit}>
      <h2 id="enquiry-title" className="h h--2xl">Talk to Expert</h2>
      <p className="enq__lede">Share a few details and continue on WhatsApp with your request already written.</p>
      <div className="enq__fields">
        <div className="field">
          <label className="field__label" htmlFor="enq-name">Your name</label>
          <input id="enq-name" className="input" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="enq-phone">Phone for a call back (optional)</label>
          <input id="enq-phone" className="input" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="enq-city">City (optional)</label>
          <input id="enq-city" className="input" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="enq-service">What do you need help with?</label>
          <select id="enq-service" className="input" required value={service} onChange={(e) => setService(e.target.value)}>
            <option value="" disabled>Select a service</option>
            {categories.map((c) => (
              <option key={c.cat} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="btn btn--blue btn--full">
        <span className="btn__label">Continue on WhatsApp</span>
        <span className="btn__icon" aria-hidden="true"><Navigation size={18} strokeWidth={1.75} /></span>
      </button>
    </form>
  );
}

export function OfficeMap() {
  return (
    <div className="officemap">
      <div className="officemap__frame">
        <iframe
          src={SITE.mapEmbed}
          title={`Map showing ${SITE.name} at ${SITE.address.full}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="officemap__info">
        <p className="officemap__k"><MapPin size={16} strokeWidth={1.75} aria-hidden="true" />Office Location</p>
        <p className="officemap__addr">{SITE.address.full}</p>
        <a className="tlink" href={SITE.mapUrl} {...ext}><span>Get directions</span></a>
      </div>
    </div>
  );
}
