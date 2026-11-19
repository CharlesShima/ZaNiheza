import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/format';

// Package builder: each day picks an overnight hotel and attractions from your catalog.
export default function ItineraryEditor({ value = [], onChange, values }) {
  const [hotels, setHotels] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [cars, setCars] = useState([]);
  const list = value || [];

  useEffect(() => {
    supabase.from('hotels').select('id, name, location, price_per_night').order('name').then(({ data }) => setHotels(data || []));
    supabase.from('attractions').select('id, name, kind, price').order('name').then(({ data }) => setAttractions(data || []));
    supabase.from('cars').select('id, name, price_per_day').then(({ data }) => setCars(data || []));
  }, []);

  const update = (i, patch) => onChange(list.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const addDay = () => onChange([...list, { day: list.length + 1, title: '', description: '', hotel_id: null, attraction_ids: [] }]);
  const removeDay = (i) => onChange(list.filter((_, j) => j !== i).map((d, j) => ({ ...d, day: j + 1 })));
  const move = (i, dir) => {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((d, k) => ({ ...d, day: k + 1 })));
  };
  const toggleAttr = (i, id) => {
    const cur = list[i].attraction_ids || [];
    update(i, { attraction_ids: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };

  // Rough base cost, before your margin: hotel nights + attraction fees + vehicle days
  const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
  const H = byId(hotels), A = byId(attractions), C = byId(cars);
  const hotelCost = list.reduce((s, d) => s + (Number(H[d.hotel_id]?.price_per_night) || 0), 0);
  const attrCost = list.reduce((s, d) => s + (d.attraction_ids || []).reduce((t, id) => t + (Number(A[id]?.price) || 0), 0), 0);
  const carCost = (Number(C[values?.car_id]?.price_per_day) || 0) * (Number(values?.duration_days) || list.length || 0);
  const cur = values?.currency || 'USD';

  return (
    <div className="itin-editor">
      {list.map((d, i) => (
        <div key={i} className="itin-day">
          <div className="itin-day__head">
            <strong>Day {i + 1}</strong>
            <span>
              <button type="button" className="btn btn--small btn--text" onClick={() => move(i, -1)} disabled={i === 0}>Move up</button>
              <button type="button" className="btn btn--small btn--text" onClick={() => move(i, 1)} disabled={i === list.length - 1}>Move down</button>
              <button type="button" className="btn btn--small btn--text danger" onClick={() => removeDay(i)}>Remove day</button>
            </span>
          </div>
          <input placeholder="Day title, e.g. Gorilla trekking in Volcanoes NP" value={d.title || ''} onChange={(e) => update(i, { title: e.target.value })} />
          <textarea rows="3" placeholder="What happens this day" value={d.description || ''} onChange={(e) => update(i, { description: e.target.value })} />
          <label className="inline-label">Overnight
            <select value={d.hotel_id || ''} onChange={(e) => update(i, { hotel_id: e.target.value || null })}>
              <option value="">No hotel (last day or day trip)</option>
              {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}{h.location ? `, ${h.location}` : ''}</option>)}
            </select>
          </label>
          {attractions.length > 0 && (
            <div className="attr-picks" role="group" aria-label={`Attractions on day ${i + 1}`}>
              {attractions.map((a) => (
                <label key={a.id} className={`chip ${(d.attraction_ids || []).includes(a.id) ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={(d.attraction_ids || []).includes(a.id)} onChange={() => toggleAttr(i, a.id)} />
                  {a.name}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn btn--small btn--outline" onClick={addDay}>Add day</button>
      <div className="cost-box">
        <strong>Estimated base cost</strong>
        <span>Hotels {formatPrice(hotelCost, cur)}</span>
        <span>Attractions {formatPrice(attrCost, cur)}</span>
        <span>Vehicle {formatPrice(carCost, cur)}</span>
        <span className="cost-total">Total {formatPrice(hotelCost + attrCost + carCost, cur)}</span>
        <small>Per room / per vehicle, before your margin. Set your selling price in "Price from".</small>
      </div>
    </div>
  );
}
