import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, PageHeader, EndCta, Todo, AdminOnly } from '../components/ui';

export default function Privacy() {
  usePageMeta('privacy');
  const SITE = useSite();
  const h = 'text-2xl mt-10 mb-3';
  return (
    <>
      <PageHeader kicker="Privacy" title="Privacy" intro="Here is what this website collects, why, and what we do with it." />
      <Section tone="cream" narrow>
        <p className="mb-6"><Todo id="legal-review">[LEGAL REVIEW: have someone qualified review this page before launch]</Todo></p>
        <div className="space-y-4 text-lg leading-relaxed text-black/80">
          <h2 className={h}>Forms</h2>
          <p>When you send the Connect Card, a prayer request, or any other form, we receive the information you type. We use it only to reply to you, to prepare for your visit, or to follow up on what you asked about. Forms are stored in our staff dashboard and sent to {SITE.email}. Only our staff and volunteers who need the information can see it. Prayer requests marked private stay with the prayer team.</p>
          <h2 className={h}>Giving</h2>
          <p>Online giving is handled by Realm, a church management service. When you give, you leave this site and use Realm’s secure form. We do not see or store your card or bank details.</p>
          <h2 className={h}>Videos, maps, and other services</h2>
          <p>Message videos come from YouTube, and a video loads only after you press play. Maps come from Google Maps. Podcast links go to Apple Podcasts and Spotify. These services have their own privacy policies.</p>
          <h2 className={h}>Cookies and similar storage</h2>
          <p>This site stores a small note in your browser when you dismiss an announcement, so it does not keep showing. Staff who sign in to the dashboard also have a sign-in session. <Todo id="analytics">[ADD GOOGLE ANALYTICS OR SIMILAR ID, AND DESCRIBE IT HERE IF USED]</Todo></p>
          <h2 className={h}>We do not sell your information</h2>
          <p>We do not sell or rent your information, and we do not use it for advertising.</p>
          <h2 className={h}>Your choices</h2>
          <p>To see, correct, or delete information you sent us, email <a className="underline underline-offset-4 font-semibold text-[#8A6309]" href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.</p>
          <AdminOnly><p className="text-base">Last updated: <Todo id="legal-review">[DATE]</Todo></p></AdminOnly>
        </div>
      </Section>
      <EndCta title="Questions about your information?" text="Ask us. We will answer plainly." to="/contact" label="Contact us" />
    </>
  );
}
