import Seo from '../components/Seo';
import InquiryForm from '../components/InquiryForm';
import { WhatsAppIcon } from '../components/WhatsAppButton';
import { useSettings } from '../lib/settings';
import { whatsappLink } from '../lib/format';

export default function Contact() {
  const { settings } = useSettings();
  return (
    <>
      <Seo title="Plan your trip" description="Tell ZaNiheza about your trip to Rwanda. We reply within one working day with an itinerary." />
      <section className="page-head">
        <div className="container">
          <h1>Plan your trip</h1>
          <p>Tell us who is travelling and what you'd love to see. We reply within one working day.</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail-layout detail-layout--contact">
          <div className="side-card side-card--plain">
            <InquiryForm subject="Custom trip" />
          </div>
          <aside className="contact-aside">
            <h2>Prefer to talk?</h2>
            <a className="btn btn--whatsapp btn--block" target="_blank" rel="noreferrer"
               href={whatsappLink(settings.whatsapp, 'Muraho ZaNiheza! I would like to plan a trip.')}>
              <WhatsAppIcon /> WhatsApp {settings.phone}
            </a>
            <a className="btn btn--outline btn--block" href={`mailto:${settings.email}`}>Email {settings.email}</a>
            <p className="small">Based in Kigali, Rwanda. Murakaza neza, you are welcome.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
