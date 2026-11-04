import { BELIEFS_FULL } from './beliefs-full';

// The statement of beliefs shown on the About page, in the church's own words (see beliefs-full.js).
const TOPICS = [
  ['trinity', 'The Trinity'],
  ['jesus-christ', 'Jesus Christ'],
  ['holy-spirit', 'The Holy Spirit'],
  ['scripture', 'Scripture'],
  ['humanity', 'Humanity and the Fall'],
  ['salvation', 'Salvation'],
  ['gospel', 'The Gospel'],
  ['church', 'The Church'],
  ['kingdom', 'The Kingdom of God'],
  ['return', 'The Return of Christ'],
  ['women-in-leadership', 'Women in Leadership'],
  ['marriage', 'Marriage and Sexuality'],
  ['formation', 'Spiritual Formation and Discipleship'],
  ['supernatural', 'Supernatural Ministry and Spiritual Gifts'],
  ['mission', 'Cultural Engagement and Mission'],
  ['creeds', 'Our Historic Creeds'],
];

export const BELIEFS = TOPICS.map(([id, title]) => ({ id, title, full: BELIEFS_FULL[id] }));
