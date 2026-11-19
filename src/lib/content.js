// Default wording for every editable block. Admins change these in Admin > Website settings > Page text.
export const CONTENT_DEFAULTS = {
  hero_kicker: 'Launching first in Rwanda',
  idea_title: 'Travel With People, Not Crowds',
  idea_1: 'Africa through its people, launching first in Rwanda. Not just safari.',
  idea_2: 'Local young people host you in their own town.',
  idea_3: 'Small groups, real food, real places, made for content.',
  community_title: 'Community First',
  community_text: 'ZaNiheza is a community before it is a booking site. Meet members, find your interest group, and see real reviews and Stories from every Trip.',
  how_title: 'How it works',
  join_title: 'Join now — it’s free',
  join_text: 'Sign in with Google, answer 8 quick questions, and see the Trips matched for you.',
  host_title: 'Host a Trip',
  host_text: 'Show travellers your town: food, walks, bikes, coffee, translation or content. Create a host profile, get vetted, then add your own Trips.',
  stories_title: 'Stories',
  stories_text: 'Every Trip becomes a Story: real photos, video and words from the people who were there.',
  pilots_title: 'Our First Trips',
  pilots_text: 'Three pilot Trips to launch the community in Rwanda. 15 seats each.',
  footer_text: 'Africa’s Friendliest Travel Community. Launching first in Rwanda for hosting — Kigali, Nyanza and Musanze — then across Africa.',
};

export const SEO = {
  title: 'ZaNiheza | AI Travel Community Connecting Travellers With African Youth Trips',
  description: 'ZaNiheza is an AI travel community connecting travellers with youth-hosted Trips in Africa. Launching first in Rwanda: Kigali, Nyanza and Musanze. Join free.',
};

export const THEMES = {
  'kigali-yacu': { name: 'Kigali Yacu™', label: 'Community flagship', line: 'Kigali Nights and day trips: art, food, music and everyday Kigali.' },
  'sura-ahandi': { name: 'Sura Ahandi™', label: 'Small-Town Saturdays', line: 'Countryside, villages and coffee farms, hosted by local youth.' },
  umwami: { name: 'Umwami Experience™', label: 'Heritage', line: 'Nyanza heritage: the King’s Palace and the Inyambo cows.' },
  umwimerere: { name: 'Umwimerere Experience™', label: 'Private & premium', line: 'Gorillas, the Big Five and a hot-air balloon. Private, bespoke price.' },
};

export const TOWNS = ['Kigali', 'Nyanza', 'Musanze', 'Huye', 'Rubavu'];
export const INTERESTS = ['Food', 'Coffee', 'Walking', 'Biking', 'Photography & content', 'History', 'Music', 'Nature', 'Language exchange'];
export const LANGUAGES = ['English', 'French', 'Kinyarwanda', 'Swahili', 'German', 'Spanish', 'Other'];
export const TRAVEL_STYLES = ['Solo', 'With a friend or partner', 'Small group', 'Content creator'];
export const HOST_FORMATS = ['Food', 'Walking tour', 'Bike tour', 'Language & translation', 'Coffee together', 'Content creation'];
export const DIFFICULTY = ['Easy', 'Moderate', 'Active'];

export const GROUPS = [
  { name: 'Kigali', test: (m) => m.towns?.includes('Kigali') },
  { name: 'Nyanza', test: (m) => m.towns?.includes('Nyanza') },
  { name: 'Musanze', test: (m) => m.towns?.includes('Musanze') },
  { name: 'Food', test: (m) => m.interests?.includes('Food') },
  { name: 'Coffee', test: (m) => m.interests?.includes('Coffee') },
  { name: 'Content', test: (m) => m.interests?.includes('Photography & content') },
  { name: 'Biking', test: (m) => m.interests?.includes('Biking') },
  { name: 'Language', test: (m) => m.interests?.includes('Language exchange') },
];

// Shown until FAQs are loaded from the database (Admin > FAQ)
export const FAQ_DEFAULTS = [
  ['Where are you launching?', 'ZaNiheza is Africa’s Friendliest Travel Community, launching first in Rwanda for hosting: Kigali, Nyanza and Musanze first, then across Africa.'],
  ['How do I book?', 'On this site, instantly. Open a Trip, choose your seats and check out. No messages needed.'],
  ['How do I join the community?', 'Tap Join now and sign in with Google (or email). Then join our WhatsApp Community from the Community section.'],
  ['How do I host?', 'Join now, create a host profile, get vetted by ZaNiheza, then add your Trip.'],
  ['Are hosts vetted?', 'Yes. Every host sends an application, has a 15-minute call or coffee with us, and co-hosts their first Trip with ZaNiheza.'],
  ['How do I pay?', 'Securely with Stripe, right here on the site. (Our Stripe connection is being finalised.)'],
  ['Can I come alone?', 'Yes. Groups are small, 15 people at most, and you can opt in to travel-buddy matching.'],
  ['Do I need Kinyarwanda?', 'No. Hosts help with translation.'],
  ['What about gorillas and the Umwimerere Experience?', 'That’s our private, premium arm. Ask on the site for a full bespoke price.'],
  ['What if I DM on Instagram?', 'DMs are backup only. The site is the fastest way to book or host.'],
].map(([question, answer], i) => ({ id: `d${i}`, question, answer }));
