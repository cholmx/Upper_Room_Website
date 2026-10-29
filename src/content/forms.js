// Every public form. They all post to form_submissions_church and show up in the admin
// under Form Submissions. Fields named name, email and phone get their own columns.

const HOW_HEARD = ['Friend or family', 'Social media', 'Website', 'Drove by', 'Community event', 'Other'];

export const FORMS = {
  connect: {
    label: 'Connect Card',
    button: 'Send my Connect Card',
    confirmation: 'Thanks! We can’t wait to meet you on Sunday. A member of our welcome team will be watching for you.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel' },
      { name: 'visit_date', label: 'The day you plan to visit', type: 'date' },
      { name: 'has_children', label: 'Do you have children?', type: 'radio', options: ['Yes', 'No'] },
      { name: 'children_ages', label: 'Their ages', type: 'text', showIf: { has_children: 'Yes' } },
      {
        name: 'visit_status', label: 'About your visit', type: 'radio',
        options: ['I am planning my first visit', 'I have visited once', 'I have visited multiple times', 'I am ready to get connected'],
      },
      { name: 'heard_from', label: 'How did you hear about us?', type: 'select', options: HOW_HEARD },
      { name: 'message', label: 'Anything we should know? (optional)', type: 'textarea' },
    ],
  },
  contact: {
    label: 'Contact',
    button: 'Send message',
    confirmation: 'Thanks for reaching out. We will reply within 48 hours.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel' },
      {
        name: 'topic', label: 'What is this about?', type: 'select',
        options: ['Planning a visit', 'Prayer', 'Kids or youth', 'Table Groups', 'Serving', 'Giving', 'Something else'],
      },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
    ],
  },
  prayer: {
    label: 'Prayer request',
    button: 'Send my request',
    confirmation: 'We received your request, and we are praying.',
    fields: [
      { name: 'name', label: 'Your name (optional)', type: 'text', autoComplete: 'name' },
      { name: 'contact', label: 'Email or phone (optional)', type: 'text' },
      { name: 'message', label: 'How can we pray for you?', type: 'textarea', required: true },
      { name: 'private', label: 'Keep my request private to the prayer team', type: 'checkbox' },
    ],
  },
  sozo: {
    label: 'Sozo inquiry',
    button: 'Request a Sozo session',
    confirmation: 'Thank you. Our Sozo coordinator will contact you within 3 to 5 business days.',
    note: 'Your inquiry is confidential and handled with care.',
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
      { name: 'best_times', label: 'Best times to contact you', type: 'text', required: true },
      { name: 'message', label: 'Why you are interested (optional)', type: 'textarea' },
    ],
  },
  tablegroup: {
    label: 'Table Group request',
    button: 'Find me a group',
    confirmation: 'Thanks. Someone will reach out within 48 hours.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
      { name: 'group', label: 'Group you are interested in (optional)', type: 'text' },
      { name: 'preferred_day', label: 'Preferred day', type: 'select', options: ['Any day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { name: 'life_stage', label: 'Life stage', type: 'select', options: ['Student', 'Young adult', 'Married, no kids at home', 'Family with kids', 'Empty nester', 'Senior', 'Other'] },
    ],
  },
  serve: {
    label: 'Serve interest',
    button: 'Tell us what interests you',
    confirmation: 'Thank you. Someone from the team will be in touch soon.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
      {
        name: 'teams', label: 'Teams you are interested in', type: 'checkboxes',
        options: ['Welcome Team', 'Upper Room Kids', 'Upper Room Youth', 'Worship', 'Production', 'Creative', 'Media', 'Table Group host or leader', 'Sozo ministry team', 'CarePortal response team', 'Outreach and Missions'],
      },
      { name: 'best_time', label: 'Best time to reach you', type: 'text' },
    ],
  },
  baptism: {
    label: 'Baptism interest',
    button: 'Tell us you are interested',
    confirmation: 'Got it. A pastor will be in touch within 48 hours.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel' },
    ],
  },
  growthtrack: {
    label: 'Growth Track sign-up',
    button: 'Sign me up',
    confirmation: 'Got it. Someone will be in touch within 48 hours with the details.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel' },
    ],
  },
  worship: {
    label: 'Worship and creative interest',
    button: 'I am interested',
    confirmation: 'Thank you. Someone from the team will be in touch soon.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel' },
      {
        name: 'teams', label: 'Which team?', type: 'checkboxes',
        options: ['Worship Team', 'Production Team', 'Creative Team', 'Media Team'],
      },
    ],
  },
  story: {
    label: 'Story',
    button: 'Share my story',
    confirmation: 'Thank you for sharing. We will be in touch before anything is posted.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'message', label: 'Your story', type: 'textarea', required: true },
      { name: 'permission', label: 'You may share my story on the website', type: 'checkbox' },
    ],
  },
  generosity: {
    label: 'Generosity story',
    button: 'Share my story',
    confirmation: 'Thank you for sharing. We will be in touch before anything is posted.',
    fields: [
      { name: 'name', label: 'Name (optional)', type: 'text', autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'message', label: 'Your story', type: 'textarea', required: true },
    ],
  },
};

export const FORM_KEYS = Object.keys(FORMS);
