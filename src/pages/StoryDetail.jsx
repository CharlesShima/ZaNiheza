import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { Loading, Photo } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getStory } from '../lib/api';
import { formatDate } from '../lib/format';
import NotFound from './NotFound';

function Video({ url, title }) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/);
  if (yt) return <div style={{ aspectRatio: '16/9' }}><iframe title={title} src={`https://www.youtube-nocookie.com/embed/${yt[1]}`} style={{ width: '100%', height: '100%', border: 0, borderRadius: 16 }} allowFullScreen loading="lazy" /></div>;
  if (/\.(mp4|webm)(\?|$)/i.test(url)) return <video src={url} controls playsInline preload="metadata" style={{ width: '100%', borderRadius: 16 }} />;
  return <a className="btn btn--outline" href={url} target="_blank" rel="noreferrer">Watch the video</a>;
}

export default function StoryDetail() {
  const { slug } = useParams();
  const { data: s, loading } = useAsync(() => getStory(slug), [slug]);
  if (loading) return <div className="container section"><Loading /></div>;
  if (!s) return <NotFound />;
  const live = s.status === 'published';
  const similar = s.trip?.theme ? `/trips?theme=${s.trip.theme}` : '/trips';

  return (
    <>
      <Seo title={`${s.title} Story`} description={live ? s.summary || `${s.title}: a ZaNiheza Trip in ${s.town}.` : `Coming soon: the Story of ${s.title}, a ZaNiheza pilot Trip in ${s.town}.`} image={s.cover_image} noindex={!live} />
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container narrow" style={{ maxWidth: 860 }}>
          <Link to="/stories" className="crumb">← Back to Stories</Link>
          <span className={`status-pill ${live ? 'status-pill--live' : ''}`} style={{ marginLeft: '.5rem' }}>{live ? 'Story' : 'Coming soon'}</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginTop: '.75rem' }}>{s.title}</h1>
          <div className="facts">
            <div className="fact"><span>Town</span><strong>{s.town || '—'}</strong></div>
            <div className="fact"><span>Date</span><strong>{formatDate(s.story_date) || '—'}</strong></div>
            <div className="fact"><span>Host</span><strong>{s.host_label || 'Host to be confirmed'}</strong></div>
          </div>
          {!live ? (
            <div className="empty" style={{ margin: '1.5rem 0' }}>
              <strong>Coming soon — first Stories from our pilots</strong>
              Real photos, video and words from the people who went appear here after the Trip.
            </div>
          ) : (
            <div className="prose" style={{ maxWidth: 'none' }}>
              <div className="cover"><Photo src={s.cover_image} alt={s.title} /></div>
              {s.video_url && <Video url={s.video_url} title={s.title} />}
              <h2>What happened</h2>
              {String(s.body || '').split(/\n\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              {s.included?.length > 0 && (<><h2>What was included</h2><ul className="trip-list">{s.included.map((i) => <li key={i}>{i}</li>)}</ul></>)}
              {s.quote && <blockquote className="card" style={{ margin: '1.5rem 0' }}><p style={{ fontSize: '1.2rem', fontWeight: 600 }}>“{s.quote}”</p><cite className="small">{s.quote_by}</cite></blockquote>}
              {s.photos?.length > 0 && <div className="gallery">{s.photos.map((p) => <img key={p} src={p} alt={`From ${s.title}`} loading="lazy" />)}</div>}
            </div>
          )}
          <div className="hero-ctas">
            <Link to={similar} className="btn btn--amber">Book a similar Trip</Link>
            <Link to="/stories" className="btn btn--outline">Back to Stories</Link>
          </div>
        </div>
      </section>
    </>
  );
}
