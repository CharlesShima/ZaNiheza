import { useState } from 'react';
import { sendInquiry } from '../lib/api';

const EMPTY = { full_name: '', email: '', phone: '', country: '', travel_date: '', travelers: 2, budget: '', message: '' };

// Used for the private Umwimerere arm and group / partner enquiries
export default function InquiryForm({ subject = 'General', budgets = true }) {
  const [v, setV] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus('sending'); setError('');
    try {
      await sendInquiry({ ...v, travelers: Number(v.travelers) || 1, travel_date: v.travel_date || null, kind: 'inquiry', message: `[${subject}] ${v.message}` });
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError(`Your request wasn’t sent (${err.message}). Please try again or email muraho@zaniheza.com.`);
    }
  }

  if (status === 'sent') {
    return (
      <div role="status">
        <h3>Murakoze, {v.full_name.split(' ')[0]}.</h3>
        <p>Your request is with our team. We reply by email within one working day.</p>
      </div>
    );
  }
  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <label>Full name<input required value={v.full_name} onChange={set('full_name')} autoComplete="name" /></label>
        <label>Email<input required type="email" value={v.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Phone (optional)<input value={v.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Country<input value={v.country} onChange={set('country')} autoComplete="country-name" /></label>
        <label>Preferred start date<input type="date" value={v.travel_date} onChange={set('travel_date')} /></label>
        <label>Travellers<input type="number" min="1" max="200" value={v.travelers} onChange={set('travelers')} /></label>
        {budgets && (
          <label className="span-2">Budget per person
            <select value={v.budget} onChange={set('budget')}>
              <option value="">Not sure yet</option>
              <option>Under $1,500</option>
              <option>$1,500 to $3,000</option>
              <option>$3,000 to $6,000</option>
              <option>Over $6,000</option>
            </select>
          </label>
        )}
        <label className="span-2">Tell us about your trip<textarea value={v.message} onChange={set('message')} /></label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn--navy" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send my request'}</button>
    </form>
  );
}
