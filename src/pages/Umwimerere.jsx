import Seo from '../components/Seo';
import InquiryForm from '../components/InquiryForm';

export default function Umwimerere() {
  return (
    <>
      <Seo title="Umwimerere Experience: private gorilla, Big Five & balloon trips" description="ZaNiheza’s private, premium arm in Rwanda: gorilla trekking in Volcanoes National Park, Big Five safari and a hot-air balloon over Akagera. Bespoke price." />
      <section className="page-head">
        <div className="container">
          <span className="kicker">Private & premium</span>
          <h1>Umwimerere Experience™</h1>
          <p>Umwimerere means rare and unmatched. This is our private arm for Rwanda’s most extraordinary encounters, planned around you with a full bespoke price.</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail">
          <div className="prose">
            <h2>What it can include</h2>
            <ul className="trip-list">
              <li>Gorilla trekking: an hour with a mountain gorilla family in Volcanoes National Park</li>
              <li>Big Five safari in Akagera National Park: lion, elephant, rhino, leopard and buffalo</li>
              <li>A sunrise hot-air balloon flight over Akagera’s savannah</li>
              <li>Private vehicle, guide and the stays that suit you</li>
            </ul>
            <p className="note">These are private trips, not community Trips, so they are priced individually. Tell us your dates and group and we reply within one working day.</p>
          </div>
          <div className="card">
            <h2 style={{ fontSize: '1.5rem' }}>Ask for a bespoke price</h2>
            <InquiryForm subject="Umwimerere private trip" />
          </div>
        </div>
      </section>
    </>
  );
}
