// frontend/src/client.js (ALUT CODE EKA)

import { createClient } from '@sanity/client'; // <-- 1. Alut import kramaya
import imageUrlBuilder from '@sanity/image-url';

// 2. Secret tokens .env file eken gænīma
const adminToken = import.meta.env.VITE_SANITY_WRITE_TOKEN;
const overviewToken = import.meta.env.VITE_SANITY_READ_TOKEN;

// Admin Panel (Write access) sandahā client
export const client = createClient({ // <-- 1. Alut 'createClient' function eka
  projectId: 'a80xaoie',
  dataset: 'production',
  apiVersion: '2025-10-18',
  useCdn: false, 
  token: adminToken, // <-- 2. Arakshita token eka
});

// CEO Overview (Read-Only) sandahā client
export const overviewClient = createClient({ // <-- 1. Alut 'createClient' function eka
  projectId: 'a80xaoie',
  dataset: 'production',
  apiVersion: '2025-10-18',
  useCdn: true, 
  token: overviewToken, // <-- 2. Arakshita token eka
});


const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);