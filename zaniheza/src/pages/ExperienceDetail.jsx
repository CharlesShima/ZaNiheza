import { useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Imigongo from '../components/Imigongo';
import InquiryForm from '../components/InquiryForm';
import { Loading, ErrorNote, PackageCard, Photo } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getExperience, getPackages } from '../lib/api';
import NotFound from './NotFound';

export default function ExperienceDetail() {
  const { slug } = useParams();
  const exp = useAsync(() => getExperience(slug), [slug]);
  const e = exp.data;
  const isReal = /^[0-9a-f-]{36}$/.test(e?.id || '');
  const pkgs = useAsync(() => (isReal ? getPackages({ experienceId: e.id }) : Promise.resolve([])), [e?.id]);

  if (exp.loading) return <div className="container section"><Loading /></div>;
  if (exp.error) return <div className="container section"><ErrorNote error={exp.error} /></div>;
  if (!e) return <NotFound />;

  return (
    <>
      <Seo title={e.seo_title || `${e.name}: ${e.tagline}`} description={e.seo_description || e.summary} image={e.cover_image} />
      <section className={`exp-hero ${e.cover_image ? 'exp-hero--photo' : ''}`}>
        {e.cover_image && <img className="hero-bg" src={e.cover_image} alt="" />}
        <div className="container exp-hero__inner">
          <h1>{e.name}<sup>™</sup></h1>
          <p className="script script--lg">{e.tagline}</p>
        </div>
        <Imigongo className="hero-band" tone="amber" />
      </section>

      <section className="section">
        <div className="container detail-layout">
          <div className="prose">
            {String(e.description || '').split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>)}
            <h2>What you'll experience</h2>
            <dl className="highlights">
              {(e.highlights || []).map((h) => (
                <div key={h.title}><dt>{h.title}</dt><dd>{h.text}</dd></div>
              ))}
            </dl>
            {e.motto && <p className="script script--lg motto">{e.motto}</p>}
            {e.gallery?.length > 0 && (
              <div className="gallery">
                {e.gallery.map((src) => <Photo key={src} src={src} alt={e.name} />)}
              </div>
            )}
          </div>
          <aside className="side-card" id="enquire">
            <h2>Ask about {e.name}</h2>
            <InquiryForm experienceId={isReal ? e.id : null} subject={e.name} />
          </aside>
        </div>
      </section>

      {pkgs.data?.length > 0 && (
        <section className="section section--mist">
          <div className="container">
            <div className="section-head"><h2>{e.name} packages</h2></div>
            <div className="pkg-grid">{pkgs.data.map((p) => <PackageCard key={p.id} pkg={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
