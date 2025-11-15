import { config, fields, collection } from '@keystatic/core';

const events = collection({
  label: 'Events',
  slugField: 'title',
  path: 'src/content/events/*',
  format: { contentField: 'content' },
  schema: {
    title: fields.slug({ name: { label: 'Event Title' } }),
    location: fields.relationship({
      label: 'Location',
      collection: 'locations', // Links to locations collection
    }),
    date: fields.date({ 
      label: 'Event Date',
      description: 'Select month and day. Year represents fantasy calendar year.'
    }),
    content: fields.markdoc({ 
      label: 'Description',
    }),
  },
});

const regions = collection({
  label: 'Regions',
  slugField: 'name',
  path: 'src/content/regions/*',
  format: { contentField: 'content' },
  schema: {
    name: fields.slug({ name: { label: 'Region Name' } }),
    content: fields.markdoc({
      label: 'Description',
    }),
  },
});

const locations = collection({
  label: 'Locations',
  slugField: 'name',
  path: 'src/content/locations/*',
  format: { contentField: 'content' },
  schema: {
    name: fields.slug({ name: { label: 'Name' } }),
    region: fields.relationship({
      label: 'Region',
      collection: 'regions', // Links to regions collection
    }),
    image: fields.image({
      label: 'Location Image',
      directory: 'src/assets/images/locations',
      publicPath: '/src/assets/images/locations/',
    }),
    latitude: fields.number({ 
      label: 'Latitude',
      description: 'e.g., 40.7128',
      validation: { min: -90, max: 90 }
    }),
    longitude: fields.number({ 
      label: 'Longitude',
      description: 'e.g., -74.0060',
      validation: { min: -180, max: 180 }
    }),
    content: fields.markdoc({
      label: 'Description',
    }),
  },
});

export default config({
  storage: {
    kind: 'local', // Stores in Git - perfect for free hosting
  },
  collections: {
    locations,
    regions,
    events,
  },
});