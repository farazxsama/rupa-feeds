/**
 * BRANCHES — content for /branches
 * Names, addresses, phone, email and map embeds are copied from the previous
 * website's branches page (rupafeeds.shop/our_branches). `mapSrc` is the
 * Google Maps embed that page used for the branch.
 */
export interface Branch {
  name: string;
  address: string;
  phone: { label: string; tel: string };
  email: string;
  mapSrc: string;
}

const phone = { label: "94404 31234", tel: "+919440431234" };
const email = "Rupafeed@gmail.com";

export const branchesPage = {
  hero: {
    eyebrow: "Our branches",
    title: "Find a Rupa Feeds branch near you",
    body: "Visit or call any of our branches for our floating, sinking and polyculture feeds.",
  },
  cta: {
    title: "Need help finding a branch?",
    body: "Get in touch and our team will point you to the nearest branch or dealer.",
  },
};

export const branches: Branch[] = [
  {
    name: "Madepalle Eluru",
    address: "Madepalle Eluru",
    phone,
    email,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d232466.31945663586!2d80.9540610657879!3d16.70867237121205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a361500529b2425%3A0x479d9f3249a493ae!2sRupa%20Feeds!5e1!3m2!1sen!2sin!4v1768377477466!5m2!1sen!2sin",
  },
  {
    name: "Kaikalur",
    address: "Shop No 6, Katragadda Complex, 149/1, Eluru Road, near Lotus Medical Center, Achavaram, Lokamudi, Andhra Pradesh 521333",
    phone,
    email,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116255.56502628994!2d81.00384286411972!3d16.67184016135776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a363d0017df6569%3A0x459c1fd7cd171cc7!2sRupafeeds!5e1!3m2!1sen!2sin!4v1768377806311!5m2!1sen!2sin",
  },
  {
    name: "Gundugolanu",
    address: "kovvur road, Gundugolanu, Andhra Pradesh 534427",
    phone,
    email,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4524.480728541198!2d81.1702517581961!3d16.688905213788846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3641001eea68a1%3A0x97a4a8220b886b5f!2sRupa%20Feeds!5e1!3m2!1sen!2sin!4v1784785491847!5m2!1sen!2sin",
  },
  {
    name: "Kalidindi",
    address: "G73M+2VC, Kalidindi, Andhra Pradesh 521344",
    phone,
    email,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3636.1846589965235!2d81.2846886!3d16.5025805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3625007ec49cf5%3A0x24cea1ee6dcd27c9!2sRupa%20Feeds!5e1!3m2!1sen!2sin!4v1783938986320!5m2!1sen!2sin",
  },
  {
    name: "Ingilipaka Lanka",
    address: "High School oppo complex, Ingilipakalanka, Andhra Pradesh 521326",
    phone,
    email,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d457.60451002111154!2d81.12338879434859!3d16.547133489736368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3617a6bd0e1483%3A0x48f7e66d7826e9be!2sIngilipakalanka%2C%20Andhra%20Pradesh!5e1!3m2!1sen!2sin!4v1784787024032!5m2!1sen!2sin",
  },
  {
    name: "Gutlapadu",
    address: "CFQJ+F3V, Main Rd, Bhimavaram, Gutlapadu, Andhra Pradesh 534239",
    phone,
    email,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3637.3870312347344!2d81.4804472!3d16.438509800000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a362b003546849f%3A0xf6de036f05f508b6!2sRupa%20Feeds!5e1!3m2!1sen!2sin!4v1783939113264!5m2!1sen!2sin",
  },
];
