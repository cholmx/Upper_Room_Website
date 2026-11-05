// Every public form. They all post to form_submissions_church and show up in the admin
// under Form Submissions. Fields named name, email and phone get their own columns.

const HOW_HEARD = ['Friend or family', 'Social media', 'Website', 'Drove by', 'Community event', 'Other'];

export const FORMS = {
  connect: {
    label: 'Connect Card',
    button: 'Submit',
    confirmation: 'Thank you. We received your Connect Card, and a member of our welcome team will be in touch within 48 hours.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel' },
      { name: 'has_children', label: 'Do you have children?', type: 'select', options: ['Yes', 'No'] },
      {
        name: 'visit_status', label: 'About your visit', type: 'select',
        options: ['I am planning my first visit', 'I have visited once', 'I have visited multiple times', 'I am ready to get connected'],
      },
      { name: 'heard_from', label: 'How did you hear about us?', type: 'select', options: HOW_HEARD },
    ],
  },
  contact: {
    label: 'Contact',
    button: 'Send Message',
    confirmation: 'Thanks for reaching out. We will reply within 48 hours.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
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
