import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { Loading, ErrorNote, PackageCard } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getExperiences, getPackages } from '../lib/api';

export default function Packages() {
  const [params, setParams] = useSearchParams();
  const current = params.get('experience') || '';
  const exps = useAsync(getExperiences, []);
  const expId = exps.data?.find((e) => e.slug === current)?.id;
  const pkgs = useAsync(
    () => (current && !exps.data ? Promise.resolve(null) : getPackages({ experienceId: expId })),
    [current, expId, Boolean(exps.data)]
  );

  return (
    <>
      <Seo title="Rwanda tour packages" description="Ready-made Rwanda itineraries with prices and dates: gorilla trekking, Akagera safaris, Kigali city experiences, cultural journeys." />
      <section className="page-head">
        <div className="container">
          <h1>Packages</h1>
          <p>Ready-made itineraries with clear prices. Every one can be adjusted to your dates and group.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="filters" role="group" aria-label="Filter by experience">
            <button className={`chip ${!current ? 'is-on' : ''}`} onClick={() => setParams({})}>All</button>
            {(exps.data || []).map((e) => (
              <button key={e.id} className={`chip ${current === e.slug ? 'is-on' : ''}`} onClick={() => setParams({ experience: e.slug })}>
                {e.name}
              </button>
            ))}
          </div>
          {pkgs.loading && <Loading />}
          {pkgs.error && <ErrorNote error={pkgs.error} />}
          {pkgs.data?.length === 0 && (
            <p className="note">No packages here yet. Tell us what you have in mind and we'll design one for you.</p>
          )}
          <div className="pkg-grid">{(pkgs.data || []).map((p) => <PackageCard key={p.id} pkg={p} />)}</div>
        </div>
      </section>
    </>
  );
}
