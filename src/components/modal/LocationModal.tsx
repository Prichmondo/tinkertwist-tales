import { useEffect, useState } from 'react';
import styles from './locationModal.module.css';

type LocationData = {
  id: string;
  data: {
    name: string;
    region: string;
    image?: string;
    latitude: number;
    longitude: number;
  };
  body: string;
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
    <div className={styles.container}>
      <h2 className={styles.title}>{data.data.name}</h2>
      <div className={styles.content}>
        {data.body}
      </div>
    </div>
  );
};
