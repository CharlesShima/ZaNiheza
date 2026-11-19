// Rule-based matching for now: town + dates + interests + language. Not an AI model yet.
const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}` : a[0]);

export function matchTrip(profile, trip) {
  if (!profile?.profile_done || !trip) return null;
  let score = 0;
  const reasons = [];

  if ((profile.towns || []).includes(trip.town)) {
    score += 30;
    reasons.push(`You want to see ${trip.town}`);
  }
  if (profile.rwanda_from && trip.starts_at) {
    const start = new Date(trip.starts_at);
    const from = new Date(`${profile.rwanda_from}T00:00:00`);
    const to = new Date(`${profile.rwanda_to || profile.rwanda_from}T23:59:59`);
    if (start >= from && start <= to) {
      score += 30;
      reasons.push('It fits your dates in Rwanda');
    }
  }
  const shared = (trip.interests || []).filter((i) => (profile.interests || []).includes(i));
  if (shared.length) {
    score += Math.min(25, shared.length * 10);
    reasons.push(`Matches your love of ${list(shared.slice(0, 2).map((s) => s.toLowerCase()))}`);
  }
  const langs = (trip.languages || []).filter((l) => (profile.languages || []).includes(l));
  if (langs.length) {
    score += 15;
    reasons.push(`Hosted in ${list(langs.slice(0, 2))}`);
  }
  return { score: Math.min(100, score), reasons: reasons.slice(0, 3) };
}

export function matchedTrips(profile, trips) {
  return (trips || [])
    .map((t) => ({ trip: t, match: matchTrip(profile, t) }))
    .filter((x) => x.match && x.match.score > 0)
    .sort((a, b) => b.match.score - a.match.score);
}
