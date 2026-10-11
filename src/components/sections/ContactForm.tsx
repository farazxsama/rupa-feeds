"use client";

import { useRef, useState, type FormEvent } from "react";
import { contact } from "@/config/contact";

type Field = "firstName" | "lastName" | "email" | "phone" | "subject" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" };
const ORDER: Field[] = ["firstName", "lastName", "email", "phone", "subject", "message"];

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = "Please enter your first name.";
  if (!v.lastName.trim()) e.lastName = "Please enter your last name.";
  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Please enter a valid email address.";
  const digits = v.phone.replace(/\D/g, "");
  if (!v.phone.trim()) e.phone = "Please enter your phone number.";
  else if (/[^\d\s+()-]/.test(v.phone) || digits.length < 10 || digits.length > 13) e.phone = "Please enter a valid phone number (10 digits).";
  if (!v.subject) e.subject = "Please choose a subject.";
  if (!v.message.trim()) e.message = "Please write your message.";
  else if (v.message.trim().length < 10) e.message = "Please add a little more detail (at least 10 characters).";
  return e;
}

/**
 * NOT CONNECTED YET — this is the single place to wire the form to a backend
 * (API route, email service, CRM…). It must resolve on success and throw on
 * failure; the form already shows the matching success / error message.
 */
async function submitContact(values: Values): Promise<void> {
  void values;
  await new Promise((resolve) => setTimeout(resolve, 600));
}

const inputCls =
  "mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 transition-colors focus:outline-none focus:ring-2 focus:ring-pond-500/40";

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    if (status === "success" || status === "error") setStatus("idle");
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (status === "sending") return;
    const found = validate(values);
    setErrors(found);
    const firstBad = ORDER.find((f) => found[f]);
    if (firstBad) {
      setStatus("idle");
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      await submitContact(values);
      setValues(EMPTY);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const field = (name: Field) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    className: `${inputCls} ${errors[name] ? "border-red-500" : "border-ink/15 hover:border-pond-500/60 focus:border-pond-500"}`,
  });
  const label = (name: Field, text: string) => (
    <label htmlFor={`contact-${name}`} className="text-sm font-semibold text-ink">
      {text} <span className="text-red-600" aria-hidden="true">*</span>
    </label>
  );
  const error = (name: Field) =>
    errors[name] ? (
      <p id={`contact-${name}-error`} className="mt-1.5 text-sm text-red-600">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-labelledby="contact-form-title">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          {label("firstName", "First Name")}
          <input {...field("firstName")} type="text" autoComplete="given-name" onChange={(e) => set("firstName", e.target.value)} />
          {error("firstName")}
        </div>
        <div>
          {label("lastName", "Last Name")}
          <input {...field("lastName")} type="text" autoComplete="family-name" onChange={(e) => set("lastName", e.target.value)} />
          {error("lastName")}
        </div>
        <div>
          {label("email", "Email")}
          <input {...field("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" onChange={(e) => set("email", e.target.value)} />
          {error("email")}
        </div>
        <div>
          {label("phone", "Phone")}
          <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile number" onChange={(e) => set("phone", e.target.value)} />
          {error("phone")}
        </div>
        <div className="sm:col-span-2">
          {label("subject", "Subject")}
          <select {...field("subject")} onChange={(e) => set("subject", e.target.value)}>
            <option value="">Choose a subject</option>
            {contact.form.subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {error("subject")}
        </div>
        <div className="sm:col-span-2">
          {label("message", "Message")}
          <textarea {...field("message")} rows={5} onChange={(e) => set("message", e.target.value)} />
          {error("message")}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={status === "sending"} className="btn-dark disabled:cursor-not-allowed disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>
        <p className="text-sm text-ink/55">
          <span className="text-red-600" aria-hidden="true">*</span> All fields are required.
        </p>
      </div>

      <div aria-live="polite" className="mt-5">
        {status === "success" && (
          <p role="status" className="rounded-2xl border border-emerald-600/25 bg-emerald-50 px-5 py-4 text-[15px] font-medium text-emerald-800">
            {contact.form.success}
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-50 px-5 py-4 text-[15px] font-medium text-red-700">
            {contact.form.failure}
          </p>
        )}
        {status === "idle" && Object.values(errors).some(Boolean) && (
          <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-50 px-5 py-4 text-[15px] font-medium text-red-700">
            Please correct the highlighted fields and try again.
          </p>
        )}
      </div>
    </form>
  );
}
