import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Imigongo from '../components/Imigongo';
import AuthPanel from '../components/AuthPanel';
import { Loading, MemberCard, ReviewCard, TripCard } from '../components/Common';
import { Faq, HostFormats, HostRule, HostSteps, InterestGroups, KigaliVideo, TravellerSteps, WhatsAppCommunity } from '../components/Sections';
import { useSettings, useContent } from '../lib/settings';
import { useAuth } from '../lib/auth';
import { useAsync } from '../lib/useAsync';
import { getMembers, getReviews, getStories, getTrips } from '../lib/api';
import { matchedTrips } from '../lib/match';
import { ProfileForm } from './Me';
import { AddTrip, HostProfileForm, MyTrips } from './HostApply';
import { THEMES } from '../lib/content';
import { SEO } from '../lib/content';

const SITE = (import.meta.env.VITE_SITE_URL || 'https://zaniheza.com').replace(/\/$/, '');

function HeroTitle({ text }) {
  const words = String(text).trim().split(' ');
  if (words.length < 3) return <h1>{text}</h1>;
  return <h1>{words.slice(0, -2).join(' ')} <em>{words.slice(-2).join(' ')}</em></h1>;
}

export default function Home() {
  const { settings } = useSettings();
  const c = useContent();
  const { user, profile, host, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const [tick, setTick] = useState(0);
  const trips = useAsync(() => getTrips(), []);
  const pilots = { loading: trips.loading, data: (trips.data || []).filter((t) => t.is_pilot) };
  const upcoming = (trips.data || []).filter((t) => t.status === 'approved' && (!t.starts_at || new Date(t.starts_at) > new Date()));
  const matches = matchedTrips(profile, upcoming);

  // Coming back from Google sign-in: jump to the section the person started in
  useEffect(() => {
    if (authLoading) return;
    const target = params.get('join') ? 'join' : params.get('host') ? 'host' : null;
    if (target) document.getElementById(target)?.scrollIntoView();
  }, [authLoading, params]);
  const stories = useAsync(getStories, []);
  const members = useAsync(() => getMembers(200), []);
  const reviews = useAsync(() => getReviews({ limit: 12, withPhotos: true }), []);
  const custom = settings.hero_image_url;

  return (
    <>
      <Seo
        jsonLd={{
          '@context': 'https://schema.org', '@type': 'Organization', name: 'ZaNiheza', url: SITE,
          logo: `${SITE}/favicon/web-app-manifest-512x512.png`, description: SEO.description,
          sameAs: [settings.instagram_url, settings.tiktok_url, settings.linkedin_url].filter(Boolean),
        }}
      />

      {/* 1. HERO */}
      <section className="hero" aria-labelledby="hero-title">
        {custom ? (
          <img className="hero-bg" src={custom} alt="" fetchpriority="high" style={{ objectPosition: settings.hero_position || 'center 30%' }} />
        ) : (
          <picture>
            <source media="(max-width: 760px)" srcSet="/media/hero-kigali-mobile.webp" />
            <img className="hero-bg" src="/media/hero-kigali.webp" alt="" fetchpriority="high" style={{ objectPosition: 'center 30%' }} />
          </picture>
        )}
        <div className="container hero-inner" id="hero-title">
          <span className="badge-pill"><i aria-hidden="true" />{c.hero_kicker}</span>
          <HeroTitle text={settings.hero_title} />
          <p className="hero-sub">{settings.hero_subtitle}</p>
          <div className="hero-ctas">
            <a href="#join" className="btn btn--amber">Join now — it’s free</a>
            <a href="#first-trips" className="btn btn--ghost-light">Browse Trips</a>
          </div>
          <div className="hero-stats" aria-label="Launch facts">
            <div><strong>3</strong><span>pilot Trips</span></div>
            <div><strong>15</strong><span>seats per Trip</span></div>
            <div><strong>2–3</strong><span>Trips a month</span></div>
          </div>
        </div>
      </section>
      <Imigongo />

      {/* 2. THE IDEA */}
      <section className="section" id="idea">
        <div className="container">
          <div className="idea">
            <div>
              <span className="kicker">The idea</span>
              <h2>{c.idea_title}</h2>
              <p className="lead">Not a traditional tour company: a community of curious travellers and the young locals who host them.</p>
              <Link to="/about" className="link-arrow">Read the full idea</Link>
            </div>
            <ol className="idea-points">
              <li>{c.idea_1}</li>
              <li>{c.idea_2}</li>
              <li>{c.idea_3}</li>
            </ol>
          </div>
          <div className="themes">
            {Object.entries(THEMES).map(([slug, t]) => (
              <Link key={slug} to={slug === 'umwimerere' ? '/umwimerere' : `/trips?theme=${slug}`} className={`theme ${slug === 'umwimerere' ? 'theme--private' : ''}`}>
                <small>{t.label}</small>
                <strong>{t.name}</strong>
                <span>{t.line}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMMUNITY FIRST */}
      <section className="section section--sand" id="community">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Community</span>
            <h2>{c.community_title}</h2>
            <p>{c.community_text}</p>
          </div>
          <div className="community-grid">
            <div className="card">
              <h3 className="subhead" style={{ marginTop: 0 }}>Members</h3>
              {members.loading ? <Loading /> : members.data?.length ? (
                <div className="members">{members.data.slice(0, 8).map((m) => <MemberCard key={m.id} m={m} />)}</div>
              ) : (
                <div className="empty"><strong>Be one of our first members</strong>Public member profiles appear here as people join.</div>
              )}
              <h3 className="subhead">Interest groups</h3>
              <InterestGroups members={members.data} />
              <h3 className="subhead">Reviews from real Trips</h3>
              {reviews.data?.length ? (
                <div className="stack">{reviews.data.slice(0, 2).map((r) => <ReviewCard key={r.id} review={r} />)}</div>
              ) : (
                <div className="empty"><strong>No reviews yet</strong>Reviews with photos appear here after our first Trips. Only travellers who went can review.</div>
              )}
              <h3 className="subhead">Stories wall</h3>
              <div className="chips">
                {(stories.data || []).slice(0, 3).map((s) => <Link key={s.id} className="chip" to={`/stories/${s.slug}`}>{s.title}</Link>)}
                <Link className="chip" to="/stories">All Stories</Link>
              </div>
              <p style={{ marginTop: '1.25rem', marginBottom: 0 }}><Link to="/community" className="link-arrow">Open the Community</Link></p>
            </div>
            <div className="stack">
              <WhatsAppCommunity />
              <KigaliVideo />
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="section" id="how">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="kicker">Simple by design</span>
            <h2>{c.how_title}</h2>
            <p>Joining, hosting and booking all happen here on the platform.</p>
          </div>
          <div className="paths">
            <div className="card path">
              <h3>For travellers <span className="path-tag">Join, browse, book</span></h3>
              <TravellerSteps />
            </div>
            <div className="card path">
              <h3>For hosts <span className="path-tag">Profile, vetting, Trips</span></h3>
              <HostSteps />
              <HostRule />
            </div>
          </div>
        </div>
      </section>

      {/* 5. JOIN */}
      <section className="section section--sand" id="join">
        <div className="container join-box">
          <div>
            <span className="kicker">Join the community</span>
            <h2>{c.join_title}</h2>
            <p className="lead">{c.join_text}</p>
            <div className="card" style={{ marginTop: '1.25rem' }}>
              <h3>After you join: Matched for you</h3>
              <p className="muted">We compare each Trip with your profile and show a match score with the reasons in plain words: your towns, your dates in Rwanda, shared interests and languages, and your content goal.</p>
              <p className="small" style={{ margin: 0 }}>Matching is rule-based for now and gets smarter as the community grows.</p>
            </div>
          </div>
          <div className="card">
            {!user ? (
              <>
                <h3>Create your free profile</h3>
                <p className="muted">Sign in, then answer 8 short questions right here:</p>
                <ol className="small" style={{ columns: 2, columnGap: '1.5rem', paddingLeft: '1.2rem', margin: '0 0 1rem' }}>
                  <li>Name</li><li>Photo</li><li>Home city & country</li><li>Languages</li>
                  <li>Interests</li><li>Towns to see</li><li>Travel style</li><li>Dates in Rwanda</li>
                </ol>
                <AuthPanel next="/?join=1" />
              </>
            ) : !profile?.profile_done ? (
              <ProfileForm />
            ) : (
              <div className="stack">
                <h3 style={{ margin: 0 }}>Matched for you{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h3>
                {matches.length ? matches.slice(0, 2).map(({ trip, match }) => (
                  <Link key={trip.id} to={`/trips/${trip.slug}`} className="fact" style={{ textDecoration: 'none', display: 'grid', gap: '.3rem' }}>
                    <span className="match-badge"><b>{match.score}%</b> match</span>
                    <strong>{trip.title}</strong>
                    <ul className="reasons">{match.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                  </Link>
                )) : <p className="muted">No strong matches yet. Add towns or your dates in Rwanda to your profile.</p>}
                <Link className="btn btn--navy" to="/me">All my matches and bookings</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. HOST A TRIP */}
      <section className="section section--navy" id="host">
        <div className="container paths">
          <div>
            <span className="kicker">For local youth</span>
            <h2>{c.host_title}</h2>
            <p style={{ fontSize: '1.15rem' }}>{c.host_text}</p>
            <p>Host profiles show your town, languages, formats, “my town in 3 places”, availability, and reviews from travellers who actually went. New hosts show “New host — first Trip co-hosted by ZaNiheza”.</p>
            <div className="hero-ctas">
              <Link to="/hosts" className="btn btn--ghost-light">Meet the hosts</Link>
            </div>
            <p className="small" style={{ color: '#c6d2e3', marginTop: '1rem' }}>We are recruiting our first hosts now. Host profiles appear once they are vetted.</p>
          </div>
          <div className="stack">
            {!user ? (
              <div className="inline-panel">
                <h3>Become a host</h3>
                <p className="muted">Join free first. Then your host profile form opens right here.</p>
                <AuthPanel next="/?host=1" />
              </div>
            ) : !host ? (
              <HostProfileForm />
            ) : (
              <>
                <div className="inline-panel" role="status">
                  {host.status === 'pending' && <p style={{ margin: 0 }}><strong>Application received.</strong> We’ll contact you for a 15-minute call or coffee. Your first Trip is co-hosted with ZaNiheza.</p>}
                  {host.status === 'approved' && <p style={{ margin: 0 }}><strong>You’re a vetted host.</strong> Add a Trip below. <Link to={`/hosts/${host.id}`}>Your public profile</Link></p>}
                  {(host.status === 'paused' || host.status === 'rejected') && <p style={{ margin: 0 }}>Your hosting is {host.status}. Email muraho@zaniheza.com to talk about it.</p>}
                  <p style={{ margin: '.6rem 0 0' }}><Link to="/host">Edit my host profile</Link></p>
                </div>
                {host.status === 'approved' && <AddTrip onAdded={() => setTick((t) => t + 1)} />}
                <MyTrips tick={tick} />
              </>
            )}
            <div className="card" style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.15)', boxShadow: 'none' }}>
              <h3>Six ways to host</h3>
              <HostFormats />
            </div>
          </div>
        </div>
      </section>

      {/* 7. THE PILOTS */}
      <section className="section section--sand" id="first-trips">
        <div className="container">
          <div className="section-head">
            <span className="kicker">The pilots</span>
            <h2>{c.pilots_title}</h2>
            <p>{c.pilots_text}</p>
          </div>
          {pilots.loading ? <Loading /> : pilots.data?.length ? (
            <div className="grid-3">{pilots.data.map((t) => <TripCard key={t.id} trip={t} inlineBook />)}</div>
          ) : (
            <div className="empty"><strong>Trips load from your database</strong>Run the community migration in Supabase to add the 3 pilots.</div>
          )}
          <p className="small center" style={{ marginTop: '1.5rem' }}>After the pilots: 2–3 Trips a month. Members vote for the next town.</p>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="section" id="faq">
        <div className="container narrow">
          <div className="section-head section-head--center">
            <span className="kicker">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
          <Faq />
        </div>
      </section>
    </>
  );
}
