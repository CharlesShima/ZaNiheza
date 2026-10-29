import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { Photo, Loading, ErrorNote } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getExperiences } from '../lib/api';

export default function Experiences() {
  const { data, loading, error } = useAsync(getExperiences, []);
  return (
    <>
      <Seo title="Experiences" description="Kigali Yacu, Sura Ahandi, Umwimerere and Umwami: four curated ways to experience Rwanda's culture, history and wildlife." />
      <section className="page-head">
        <div className="container">
          <h1>Experiences</h1>
          <p>City, countryside, wildlife and royal heritage. Choose a theme and we shape the journey around you.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {loading && <Loading />}
          {error && <ErrorNote error={error} />}
          <div className="exp-grid">
            {(data || []).map((e) => (
              <Link key={e.id} to={`/experiences/${e.slug}`} className="exp-tile">
                <Photo src={e.cover_image} alt={e.name} className="exp-tile__img" />
                <div className="exp-tile__body">
                  <h2>{e.name}<sup>™</sup></h2>
                  <p className="script">{e.tagline}</p>
                  <p>{e.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
