import React from 'react';
import AdminOutreachClient from './AdminOutreachClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Outreach Acquisition System | SwasthAI Ops',
  description: 'First-party B2B Cold Email & Clinic Acquisition Engine powered by Brevo Transactional Email.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminOutreachPage() {
  return <AdminOutreachClient />;
}
