import { useState } from 'react';
import { sendInquiry } from '../lib/api';
import { useSettings } from '../lib/settings';
import { formatDate, formatPrice, whatsappLink } from '../lib/format';
import { WhatsAppIcon } from './WhatsAppButton';

const EMPTY = { full_name: '', email: '', phone: '', country: '', travel_date: '', travelers: 2, budget: '', message: '' };

export default function InquiryForm({ packageId = null, experienceId = null, departures = [], subject = '', currency = 'USD' }) {
  const { settings } = useSettings();
  const [values, setValues] = useState(EMPTY);
  const [departureId, setDepartureId] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const isBooking = Boolean(departureId);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const dep = departures.find((d) => d.id === departureId);
    try {
      await sendInquiry({
        ...values,
        travelers: Number(values.travelers) || 1,
        travel_date: dep?.start_date || values.travel_date || null,
        kind: isBooking ? 'booking' : 'inquiry',
        package_id: packageId,
        experience_id: experienceId,
        departure_id: departureId || null,
        message: subject ? `[${subject}] ${values.message}` : values.message,
      });
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError(`Your request wasn't sent (${err.message}). Please try again, or write to us on WhatsApp.`);
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-done" role="status">
        <h3>Murakoze, {values.full_name.split(' ')[0]}.</h3>
        <p>Your {isBooking ? 'booking request' : 'request'} is with our travel team. We reply by email within one working day with your itinerary and next steps.</p>
        <a className="btn btn--whatsapp" target="_blank" rel="noreferrer"
           href={whatsappLink(settings.whatsapp, `Muraho! I just sent a request${subject ? ` about ${subject}` : ''}. My name is ${values.full_name}.`)}>
          <WhatsAppIcon /> Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={onSubmit}>
      {departures.length > 0 && (
        <fieldset className="departures">
          <legend>Choose a departure date, or ask for your own dates</legend>
          <label className="dep-option">
            <input type="radio" name="dep" checked={!departureId} onChange={() => setDepartureId('')} />
            <span>My own dates</span>
          </label>
          {departures.map((d) => {
            const left = Math.max(d.seats_total - d.seats_booked, 0);
            const full = d.status === 'full' || left === 0;
            return (
              <label key={d.id} className={`dep-option ${full ? 'is-full' : ''}`}>
                <input type="radio" name="dep" disabled={full} checked={departureId === d.id} onChange={() => setDepartureId(d.id)} />
                <span>{formatDate(d.start_date)}</span>
                <span className="dep-meta">
                  {full ? 'Full' : `${left} places left`}
                  {d.price ? `, ${formatPrice(d.price, currency)}` : ''}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      <div className="form-grid">
        <label>Full name<input required value={values.full_name} onChange={set('full_name')} autoComplete="name" /></label>
        <label>Email<input required type="email" value={values.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Phone or WhatsApp<input value={values.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Country<input value={values.country} onChange={set('country')} autoComplete="country-name" /></label>
        {!departureId && (
          <label>Preferred start date<input type="date" value={values.travel_date} onChange={set('travel_date')} /></label>
        )}
        <label>Travelers<input type="number" min="1" max="200" value={values.travelers} onChange={set('travelers')} /></label>
        <label>Budget per person
          <select value={values.budget} onChange={set('budget')}>
            <option value="">Not sure yet</option>
            <option>Under $500</option>
            <option>$500 to $1,500</option>
            <option>$1,500 to $3,000</option>
            <option>Over $3,000</option>
          </select>
        </label>
        <label className="span-2">What would you like from this trip?
          <textarea rows="4" value={values.message} onChange={set('message')}
            placeholder="Occasion (honeymoon, retreat, family reunion), interests, accommodation style…" />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn--amber btn--block" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : isBooking ? 'Request this booking' : 'Send my request'}
      </button>
      <p className="form-note">No payment now. We confirm availability and send your itinerary first.</p>
    </form>
  );
}
