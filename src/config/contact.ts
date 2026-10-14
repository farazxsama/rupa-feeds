/**
 * CONTACT PAGE CONTENT
 * Details are carried over from the previous website's contact page
 * (rupafeeds.shop/contact). Edit here; the page reads from this file.
 */
export const contact = {
  hero: {
    eyebrow: "Contact us",
    title: "Get in Touch",
    body: "Questions about our feeds, technical support or becoming a dealer? Reach out and our team will be glad to help.",
  },

  address: {
    title: "Our Location",
    lines: ["Madepalle, Eluru", "Andhra Pradesh 534004"],
  },
  emails: ["Rupafeed@gmail.com", "support@rupafeeds.com"],
  phones: [
    { label: "94404 31234", tel: "+919440431234" },
    { label: "93948 90946", tel: "+919394890946" },
  ],

  /** Number used by the floating Call / WhatsApp buttons shown on every page. */
  floating: {
    tel: "+919398490946",
    whatsapp: "https://wa.me/919398490946",
  },

  form: {
    title: "Send Us a Message",
    body: "Fill in the form and we will get back to you.",
    subjects: ["Product Inquiry", "Technical Support", "Dealer Network", "Other"],
    success: "Thank you. Your message has been received and our team will get back to you soon.",
    failure: "Sorry, something went wrong and your message was not sent. Please try again or call us.",
  },

  dealers: {
    title: "Dealer Network",
    body: "We have a Pan-India dealer network spread across the East and West coasts of India in key farming areas.",
  },

  hours: {
    title: "Business Hours",
    rows: [
      { days: "Monday – Saturday", time: "9:00 AM – 4:30 PM" },
      { days: "Sunday", time: "Closed" },
    ],
  },

  map: {
    title: "Head Office",
    /** Google Maps embed for the "Rupa Feeds" place listing (same one the previous site used). */
    embedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3632.7171761733175!2d81.1250258!3d16.686012399999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a361500529b2425%3A0x479d9f3249a493ae!2sRupa%20Feeds!5e1!3m2!1sen!2sin!4v1783940044203!5m2!1sen!2sin",
  },
};
