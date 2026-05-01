import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ContactForm from './ContactForm';
import NewsletterForm from './NewsletterForm';

// Map widget keys to actual React components
export const WIDGETS: Record<string, React.FC<any>> = {
  login_form: LoginForm,
  register_form: RegisterForm,
  contact_form: ContactForm,
  newsletter_form: NewsletterForm,  // ADD THIS
};

// Labels to display in the dropdown picker
export const WIDGET_OPTIONS = [
  { value: 'login_form', label: 'Login Form' },
  { value: 'register_form', label: 'Register Form' },
  { value: 'contact_form', label: 'Contact Form' },
  { value: 'newsletter_form', label: 'Newsletter Form' },  // ADD THIS
];
