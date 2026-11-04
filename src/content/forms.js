// Every public form. They all post to form_submissions_church and show up in the admin
// under Form Submissions. Fields named name, email and phone get their own columns.

const HOW_HEARD = ['Friend/Family', 'Social Media', 'Website', 'Drove By', 'Community Event', 'Other'];

export const FORMS = {
  connect: {
    label: 'Connect Card',
    button: 'Submit',
    confirmation: 'Thanks! We can’t wait to meet you on Sunday. A member of our welcome team will be watching for you.',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true, autoComplete: 'given-name' },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true, autoComplete: 'family-name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
      { name: 'phone', label: 'Telephone', type: 'tel', autoComplete: 'tel' },
      { name: 'address', label: 'Address', type: 'text', autoComplete: 'street-address' },
      { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
      { name: 'state', label: 'State', type: 'text', autoComplete: 'address-level1' },
      { name: 'spouse_name', label: 'Spouse Name (if applicable)', type: 'text' },
      { name: 'has_children', label: 'Children?', type: 'select', options: ['Yes', 'No'] },
      { name: 'children_ages', label: 'Children’s Names and Ages (if applicable)', type: 'textarea' },
      {
        name: 'visit_status', label: 'About Your Visit', type: 'select',
        options: ['I am planning my first visit', 'I’ve visited once', 'I’ve visited multiple times', 'I’m ready to get connected'],
      },
      { name: 'visit_date', label: 'When did you/will you visit?', type: 'date' },
      { name: 'heard_from', label: 'How did you hear about us?', type: 'select', options: HOW_HEARD },
      { name: 'prayer', label: 'Is there anything we can pray for you about?', type: 'textarea' },
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
