import { useEffect, useRef, useState } from "react";
import { CanvasMap, type MapLocation, type OnRenderCallback, type MapRenderData } from "../../service/canvasMap";
import { MapMarker } from "./mapMarker";
import { Modal } from "../modal/Modal";
import { LocationModal } from "../modal/LocationModal";
import styles from './map.module.css';

type Props = {
  mapLocations: MapLocation[];
}

export const AdventureMap = ({ mapLocations }: Props) => {
  const canvasMapRef = useRef<HTMLCanvasElement>(null);
  const [mapRenderData, setMapRenderData] = useState<MapRenderData | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const handleMapRender: OnRenderCallback = (renderData) => {
    setMapRenderData(renderData);
  }

  const handleLocationClick = (id: string) => {
    setSelectedLocationId(id);
  }

  useEffect(() => {
    console.log('Map render data updated:', mapRenderData);
  }, [mapRenderData]);

  useEffect(() => {
    console.log('Mounting AdventureMap component');
    let map: CanvasMap | null = null;
    if (canvasMapRef.current) {
      map = new CanvasMap(canvasMapRef.current, '/forgotten-realms-map.jpg', handleMapRender);
    }
    return () => {
      if (map) {
        map.dispose();
      }
    }
  }, [canvasMapRef.current, mapLocations]);

  return (
    <>
      <Modal isOpen={selectedLocationId !== null} onClose={() => setSelectedLocationId(null)}>
        <LocationModal id={selectedLocationId || ''} />
      </Modal>
      <div id="map-container" className={styles.mapContainer}>
        {mapRenderData && mapLocations.map(({ id, x, y, name, thumbnail }) => {
          const markerWidth = 40;
          const markerHeight = 50;
          const { scale, zoom, coordinates, width, height } = mapRenderData;
          const screenPos = {
            x: x * scale * zoom + coordinates.x,
            y: y * scale * zoom + coordinates.y
          };
          
          // Don't draw if off-screen (optimization)
          if (screenPos.x < -markerWidth || screenPos.x > width + markerWidth ||
              screenPos.y < -markerHeight || screenPos.y > height + markerHeight) {
            return;
          }
          return <MapMarker key={id} id={id} x={screenPos.x} y={screenPos.y} name={name} thumbnail={thumbnail} onClick={handleLocationClick} />
        })}
        <canvas className={styles.adventureMap} ref={canvasMapRef} id="adventure-map" />
      </div>
    </>    
  );
}