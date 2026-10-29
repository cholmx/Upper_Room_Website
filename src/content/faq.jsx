import React from 'react';
import { Link } from 'react-router-dom';
import { Todo } from '../components/ui';

// plain: used for the FAQPage structured data. more: an optional link after the answer.
export const FAQ = [
  { q: 'What time are services, and how long do they last?', plain: 'Sundays at 10:30am. The service usually ends around 11:45am.' },
  { q: 'What should I wear?', plain: 'Whatever you are comfortable in. You will see everything from jeans to business casual.' },
  {
    q: 'Where do I go when I arrive?',
    plain: 'Greeters at the doors will say hello and help you find your way. If you have kids, they will point you to check-in.',
    todo: { id: 'parking', text: '[PARKING AND ENTRANCE DETAILS]' },
  },
  { q: 'What about my kids?', plain: 'Kids from birth through 5th grade have their own programs during the message. The nursery is open for the whole service. Check-in is secure, and every volunteer is background-checked and trained.', more: { to: '/kids', label: 'About Upper Room Kids' } },
  { q: 'Will I have to stand up or introduce myself?', plain: 'No. We never single out visitors.' },
  { q: 'What is the music like?', plain: 'Contemporary worship music, with the lyrics on screen.' },
  { q: 'Do I need to bring a Bible?', plain: 'No. Scripture readings are on screen.' },
  { q: 'Is the building accessible?', plain: 'Yes. It is fully wheelchair accessible, and the free Listen Everywhere app streams the audio to your phone for anyone who has trouble hearing.' },
  { q: 'Do I have to give?', plain: 'Guests are never expected to give. Giving is something our church family does as an act of worship.', todo: { id: 'giving-wording', text: '[CONFIRM WORDING]' } },
  { q: 'How do I join a Table Group?', plain: 'Visit the Table Groups page and tell us what days work for you. We will help you find a fit.', more: { to: '/table-groups', label: 'Table Groups' } },
  { q: 'How do I get baptized?', plain: 'Let us know you are interested and a pastor will walk you through it.', todo: { id: 'baptism', text: '[BAPTISM PROCESS]' }, more: { to: '/next-steps#baptism', label: 'Tell us you are interested' } },
  { q: 'What is the Growth Track?', plain: 'The Growth Track helps you get to know the church and find your place in it. Let us know you are interested and we will send you the details.', todo: { id: 'growth-track', text: '[DESCRIPTION]' }, more: { to: '/next-steps#growth-track', label: 'I am interested' } },
  { q: 'What is Sozo?', plain: 'Sozo is a gentle prayer ministry for inner healing and a closer relationship with God. You can read more on the Sozo page.', more: { to: '/sozo', label: 'About Sozo' } },
  { q: 'What does your church believe?', plain: 'You can read our full statement on the beliefs page, and a short version on the About page.', more: { to: '/beliefs', label: 'What we believe' } },
  { q: 'How do I reach a pastor?', plain: 'Visit the Leadership page for emails, or send a message through the Contact page and someone will reply within 48 hours.', more: { to: '/leadership', label: 'Meet our leaders' } },
];

export function faqToAccordion(items) {
  return items.map((it, i) => ({
    id: `q-${i + 1}`,
    title: it.q,
    content: (
      <>
        <p>{it.plain}{it.todo && <> <Todo id={it.todo.id}>{it.todo.text}</Todo></>}</p>
        {it.more && <p><Link to={it.more.to} className="font-semibold text-[#8A6309] underline underline-offset-4">{it.more.label}</Link></p>}
      </>
    ),
  }));
}

const PREVIEW_QUESTIONS = [
  ['What time are services?', 'Sundays at 10:30am.'],
  ['What should I wear?', 'Whatever you are comfortable in.'],
  ['Do I need a Bible?', 'No. Scripture is on the screen.'],
  ['What about my kids?', 'Kids from birth through 5th grade have their own programs.'],
];

export const FAQ_PREVIEW = PREVIEW_QUESTIONS.map(([q, a], i) => ({ id: `p-${i + 1}`, title: q, content: <p>{a}</p> }));
