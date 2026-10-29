import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import InquiryForm from '../components/InquiryForm';
import { Loading, ErrorNote, Photo } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getByIds, getDepartures, getPackage } from '../lib/api';
import { days, formatPrice } from '../lib/format';
import NotFound from './NotFound';

export default function PackageDetail() {
  const { slug } = useParams();
  const pkgState = useAsync(() => getPackage(slug), [slug]);
  const p = pkgState.data;

  const extras = useAsync(async () => {
    if (!p) return null;
    const it = p.itinerary || [];
    const hotelIds = [...new Set(it.map((d) => d.hotel_id).filter(Boolean))];
    const attrIds = [...new Set(it.flatMap((d) => d.attraction_ids || []))];
    const [hotels, attractions, departures] = await Promise.all([
      getByIds('hotels', hotelIds), getByIds('attractions', attrIds), getDepartures(p.id),
    ]);
    return {
      hotels: Object.fromEntries(hotels.map((h) => [h.id, h])),
      attractions: Object.fromEntries(attractions.map((a) => [a.id, a])),
      departures,
    };
  }, [p?.id]);

  if (pkgState.loading) return <div className="container section"><Loading /></div>;
  if (pkgState.error) return <div className="container section"><ErrorNote error={pkgState.error} /></div>;
  if (!p) return <NotFound />;

  const x = extras.data || { hotels: {}, attractions: {}, departures: [] };
  const price = formatPrice(p.price_from, p.currency);

  return (
    <>
      <Seo title={p.seo_title || p.title} description={p.seo_description || p.summary} image={p.cover_image} />
      <section className="pkg-hero">
        <div className="container pkg-hero__grid">
          <div>
            {p.experience && <Link className="pkg-card__exp" to={`/experiences/${p.experience.slug}`}>{p.experience.name}</Link>}
            <h1>{p.title}</h1>
            <p className="lead">{p.summary}</p>
            <div className="facts">
              <div><span>Duration</span><strong>{days(p.duration_days)}</strong></div>
              <div><span>Price</span><strong>{price ? `From ${price}` : 'On request'}</strong></div>
              {p.car && <div><span>Transport</span><strong>{p.car.name}</strong></div>}
            </div>
            {p.price_notes && <p className="small">{p.price_notes}</p>}
          </div>
          <Photo src={p.cover_image} alt={p.title} className="pkg-hero__img" label={p.experience?.name} />
        </div>
      </section>

      <section className="section">
        <div className="container detail-layout">
          <div className="prose">
            {String(p.description || '').split(/\n\n+/).filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}

            {p.itinerary?.length > 0 && (
              <>
                <h2>Day by day</h2>
                <ol className="itinerary">
                  {p.itinerary.map((d, i) => {
                    const hotel = x.hotels[d.hotel_id];
                    const acts = (d.attraction_ids || []).map((id) => x.attractions[id]).filter(Boolean);
                    return (
                      <li key={i}>
                        <span className="day-num">Day {d.day || i + 1}</span>
                        <h3>{d.title}</h3>
                        {d.description && <p>{d.description}</p>}
                        {acts.length > 0 && <p className="small"><strong>Visits:</strong> {acts.map((a) => a.name).join(', ')}</p>}
                        {hotel && <p className="small"><strong>Overnight:</strong> {hotel.name}{hotel.location ? `, ${hotel.location}` : ''}</p>}
                      </li>
                    );
                  })}
                </ol>
              </>
            )}

            {(p.includes?.length > 0 || p.excludes?.length > 0) && (
              <div className="inc-exc">
                {p.includes?.length > 0 && (
                  <div><h2>Included</h2><ul className="tick-list">{p.includes.map((t) => <li key={t}>{t}</li>)}</ul></div>
                )}
                {p.excludes?.length > 0 && (
                  <div><h2>Not included</h2><ul className="cross-list">{p.excludes.map((t) => <li key={t}>{t}</li>)}</ul></div>
                )}
              </div>
            )}

            {p.gallery?.length > 0 && (
              <div className="gallery">{p.gallery.map((src) => <Photo key={src} src={src} alt={p.title} />)}</div>
            )}
          </div>
          <aside className="side-card" id="book">
            <h2>Book or ask a question</h2>
            <InquiryForm packageId={p.id} experienceId={p.experience_id} departures={x.departures} subject={p.title} currency={p.currency} />
          </aside>
        </div>
      </section>
    </>
  );
}
