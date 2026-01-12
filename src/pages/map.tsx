import { useEffect, useRef } from "react";
import { CanvasMap, type MapLocation } from "../service/canvasMap";
import styles from './map.module.css';

type Props = {
  mapLocations: MapLocation[];
}

export const AdventureMap = ({ mapLocations }: Props) => {
  const canvasMapRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('Mounting AdventureMap component');
    let map: CanvasMap | null = null;
    if (canvasMapRef.current) {
      console.log(canvasMapRef.current);
      map = new CanvasMap(canvasMapRef.current, '/forgotten-realms-map.jpg');
      map.addLocations(mapLocations);
    }
    return () => {
      if (map) {
        map.dispose();
      }
    }
  }, [canvasMapRef.current, mapLocations]);

  return (
    <canvas className={styles['adventure-map']} ref={canvasMapRef} id="adventure-map" />
  );
}