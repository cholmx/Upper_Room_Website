import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { Section, PageHeader } from '../components/ui';
import FormBlock from '../components/FormBlock';

// True on a Sunday morning in Ohio, when most people filling in the card are sitting in the service.
function sundayMorning(now = new Date()) {
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(now).map(p => [p.type, p.value]));
    const hour = Number(parts.hour) % 24;
    return parts.weekday === 'Sun' && hour >= 9 && hour < 13;
  } catch {
    return false;
  }
}

export default function Connect() {
  usePageMeta('connect');
  const [params] = useSearchParams();
  // A card filled in on a Sunday morning, or from a link ending in ?src=seat, is marked so the team can tell it came from the service.
  const source = useMemo(() => {
    const fromLink = (params.get('src') || '').trim().slice(0, 40);
    if (fromLink) return fromLink === 'seat' ? 'Seat QR code' : fromLink;
    return sundayMorning() ? 'Sunday morning' : '';
  }, [params]);
  return (
    <>
      <PageHeader
        kicker="Connect with us"
        title="We would love to meet you"
        compact
        intro="Planning your first visit? Been with us once or a few times? Ready to get connected? Fill out the Connect Card so we can welcome you well, answer your questions, and help you find your place in our church family."
      />
      <Section tone="white" narrow>
        <FormBlock formKey="connect" heading="Connect Card" intro="Fill out as much as you feel comfortable with. Only your name and email are required. Anything else helps us welcome you and your family well." defaults={source ? { source } : {}} />
      </Section>
    </>
  );
}
