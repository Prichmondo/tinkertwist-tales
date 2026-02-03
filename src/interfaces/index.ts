export interface IEntry<T> {
  id: string;
  data: T;
  body: string;
}

interface ILocationData {
    name: string;
    region: string;
    image?: string;
    latitude: number;
    longitude: number;
}

export interface ILocation extends IEntry<ILocationData> {}

interface IEventData {
    title: string;
    location: string;
    date: string;
}

export interface IEvent extends IEntry<IEventData> {}