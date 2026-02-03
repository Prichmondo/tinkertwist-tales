import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './locationModal.module.css';
import type { IEvent, ILocation } from '../../interfaces';

type LocationData = {
  location: ILocation;
  events: IEvent[];
};

type Props = {
  id: string;
};

export const LocationModal = ({ id }: Props) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/locations/${id}.json`);
        
        if (!response.ok) {
          throw new Error('Failed to load location');
        }
        
        const locationData = await response.json();
        setData(locationData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Loading location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Location not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.headerImage} style={{ backgroundImage: `url(${data.location.data.image})`  }} />
      <div className={styles.container}>  
        <h2 className={styles.title}>{data.location.data.name}</h2>
        <p className={styles.description}>
          <ReactMarkdown>{data.location.body}</ReactMarkdown>
        </p>
        {data.events.length > 0 && (
          <div className={styles.events}>
            <h3 className={styles.subtitle}>Main Events</h3>
            {data.events.map((event) => {
              return (
                <article key={event.id} className={styles.event}>
                  <header>{new Date(event.data.date).toLocaleDateString()} <b className={styles.eventTitle}>{event.data.title}</b></header>
                  <div className={styles.eventContent}>
                    <ReactMarkdown>{event.body}</ReactMarkdown>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
