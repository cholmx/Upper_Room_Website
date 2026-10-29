import { SITE } from '../config';

export const MINISTRY_FILTERS = ['Sunday', 'Kids', 'Youth', 'Table Groups', 'Outreach', 'Campaign'];

// Weekly happenings that are always on the calendar. They repeat forever, so they live in code.
export const RECURRING_EVENTS = [
  { id: 'sunday-worship', title: 'Sunday worship', date: '2024-01-07', recurrence: 'weekly', time: '10:30am', location: SITE.addressLine, ministry: 'Sunday', desc_text: 'Join us for worship and a practical, Bible-based message. Kids programs and a nursery are available.', to: '/plan-your-visit' },
  { id: 'youth-night', title: 'Upper Room Youth', date: '2024-01-03', recurrence: 'weekly', time: '6:30 to 8:00pm', location: 'The Student Center', ministry: 'Youth', desc_text: 'A safe place for 6th to 12th graders to make real friends and grow a lasting faith.', to: '/youth' },
];
