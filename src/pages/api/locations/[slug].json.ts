import { getCollection } from 'astro:content';
import type { APIRoute } from "astro";

export async function getStaticPaths() {
  const locations = await getCollection('locations');

  return locations.map((location) => ({
    params: { slug: location.id },
    props: { location },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const locations = await getCollection('locations');
  const location = locations.find((loc) => loc.id === params.slug);

  if (!location) {
    return new Response(null, { status: 404 });
  }

  return new Response(JSON.stringify(location), { status: 200 });
};