import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { Loading, MemberCard, ReviewCard, StoryCard } from '../components/Common';
import { InterestGroups, KigaliVideo, WhatsAppCommunity } from '../components/Sections';
import { useAsync } from '../lib/useAsync';
import { getMembers, getReviews, getStories } from '../lib/api';
import { useContent } from '../lib/settings';

export default function Community() {
  const c = useContent();
  const members = useAsync(() => getMembers(), []);
  const reviews = useAsync(() => getReviews({ limit: 24 }), []);
  const stories = useAsync(getStories, []);
  return (
    <>
      <Seo title="Community" description="Meet ZaNiheza members, interest groups, reviews and Stories from real youth-hosted Trips in Rwanda." />
      <section className="page-head">
        <div className="container">
          <h1>{c.community_title}</h1>
          <p>{c.community_text}</p>
        </div>
      </section>
      <section className="section">
        <div className="container community-grid">
          <div className="stack">
            <div className="card">
              <h2 style={{ fontSize: '1.6rem' }}>Members</h2>
              {members.loading ? <Loading /> : members.data?.length ? (
                <div className="members">{members.data.map((m) => <MemberCard key={m.id} m={m} />)}</div>
              ) : (
                <div className="empty"><strong>Be one of our first members</strong><Link to="/join">Join now</Link> and your public profile appears here.</div>
              )}
              <p className="small" style={{ marginTop: '1rem', marginBottom: 0 }}>Members choose whether their profile is public. We only show first name, city and interests.</p>
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1.6rem' }}>Interest groups</h2>
              <InterestGroups members={members.data} />
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1.6rem' }}>Reviews from real Trips</h2>
              {reviews.data?.length ? <div className="stack">{reviews.data.map((r) => <ReviewCard key={r.id} review={r} />)}</div>
                : <div className="empty"><strong>No reviews yet</strong>Reviews with photos appear after our first Trips.</div>}
            </div>
          </div>
          <div className="stack">
            <WhatsAppCommunity />
            <KigaliVideo />
          </div>
        </div>
      </section>
      <section className="section section--sand">
        <div className="container">
          <div className="section-head"><h2>Stories wall</h2><p>Every Trip becomes a Story.</p></div>
          <div className="grid-3">{(stories.data || []).map((s) => <StoryCard key={s.id} story={s} />)}</div>
        </div>
      </section>
    </>
  );
}
