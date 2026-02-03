import { getCollection, getEntry } from 'astro:content';
import type { APIRoute } from "astro";

export async function getStaticPaths() {
  const locations = await getCollection('locations');

  return locations.map((location) => ({
    params: { slug: location.id },
    props: { location },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  if (!params.slug) {
    return new Response(null, { status: 400 });
  }
  const location = await getEntry('locations', params.slug);
  const events = await getCollection('events', (event) =>
    event.data.location === params.slug
  );

  events.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });

  if (!location) {
    return new Response(null, { status: 404 });
  }

  return new Response(JSON.stringify({ location, events }), { status: 200 });
};