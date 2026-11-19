import Seo from '../components/Seo';
import InquiryForm from '../components/InquiryForm';
import { useSettings } from '../lib/settings';

export default function Contact() {
  const { settings } = useSettings();
  return (
    <>
      <Seo title="Contact, groups & partners" description="Contact ZaNiheza for groups, schools, creators and partnerships in Rwanda." />
      <section className="page-head"><div className="container"><h1>Contact, groups & partners</h1><p>To book a Trip, use the Trip page: it’s instant. For groups, schools, creators and partners, write to us here.</p></div></section>
      <section className="section">
        <div className="container detail">
          <div className="card"><InquiryForm subject="Group or partner" budgets={false} /></div>
          <aside className="stack">
            <a className="btn btn--outline btn--block" href={`mailto:${settings.email}`}>Email {settings.email}</a>
            <p className="small">Instagram is for discovery: {settings.instagram_handle || '@zaniheza_travel'}. Messages there are backup only.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
