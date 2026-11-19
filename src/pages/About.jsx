import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useContent, useSettings } from '../lib/settings';

export default function About() {
  const c = useContent();
  const { settings } = useSettings();
  return (
    <>
      <Seo title="The idea" description="ZaNiheza is Africa’s Friendliest Travel Community: youth-hosted Trips, launching first in Rwanda, growing across Africa." />
      <section className="page-head"><div className="container"><span className="kicker">The idea</span><h1>{c.idea_title}</h1><p>{settings.about_text}</p></div></section>
      <section className="section">
        <div className="container prose">
          <h2>Not a traditional tour company</h2>
          <p>ZaNiheza is a community: travellers curious about Africa, and the local young people who host them in their own towns. You don’t get a script. You get a friend who lives there.</p>
          <h2>Launching first in Rwanda</h2>
          <p>Rwanda is where we start hosting: Kigali, Nyanza and Musanze first, with Huye and Rubavu next. Africa is where we grow from there.</p>
          <h2>How a Trip feels</h2>
          <ul className="trip-list">
            <li>{c.idea_1}</li>
            <li>{c.idea_2}</li>
            <li>{c.idea_3}</li>
            <li>Groups of 15 at most, with a Trip chat once you book</li>
            <li>Every host is vetted, and the first Trip is co-hosted by ZaNiheza</li>
          </ul>
          <div className="hero-ctas"><Link to="/join" className="btn btn--amber">Join now — it’s free</Link><Link to="/trips" className="btn btn--outline">Browse Trips</Link></div>
        </div>
      </section>
    </>
  );
}
