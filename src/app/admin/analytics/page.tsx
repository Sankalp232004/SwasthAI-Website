import React from "react";
import type { Metadata } from "next";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export const metadata: Metadata = {
  title: "Admin Analytics & Clinic Traction Dashboard | SwasthAI",
  description: "First-party clinic operations & blog traction tracking, reading behavior, search insights, and conversion attribution.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsClient />;
}
