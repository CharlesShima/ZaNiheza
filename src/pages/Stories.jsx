import Seo from '../components/Seo';
import { Loading, StoryCard } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getStories } from '../lib/api';
import { useContent } from '../lib/settings';

export default function Stories() {
  const c = useContent();
  const { data, loading } = useAsync(getStories, []);
  return (
    <>
      <Seo title="Stories" description="Stories from ZaNiheza Trips in Rwanda: real photos, video and words from travellers and youth hosts." />
      <section className="page-head"><div className="container"><h1>{c.stories_title}</h1><p>{c.stories_text}</p></div></section>
      <section className="section">
        <div className="container">
          {loading ? <Loading /> : <div className="grid-3">{(data || []).map((s) => <StoryCard key={s.id} story={s} />)}</div>}
        </div>
      </section>
    </>
  );
}
