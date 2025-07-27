"use client";

import dynamic from "next/dynamic";
import { ContactFormSkeleton } from "./ContactForm";

const ContactForm = dynamic(
  () => import("./ContactForm").then((mod) => mod.ContactForm),
  {
    ssr: false,
    loading: () => <ContactFormSkeleton />,
  }
);

export default function ContactFormWrapper() {
  return <ContactForm />;
}
