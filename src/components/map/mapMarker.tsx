import { type MapLocation } from "../../service/canvasMap";
import styles from './mapMarker.module.css';

type Props = {
    className?: string;
    onClick?: (id: string) => void;
} & MapLocation

export const MapMarker = ({ id, x, y, name, thumbnail, className, onClick }: Props) => {
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(id);
  }
  return (
    <div id={id} className={`${styles.mapMarker} ${className || ''}`} style={{ left: `${x}px`, top: `${y}px` }} data-name={name} onClick={handleClick}>
        <div className={styles.thumbnail} style={{ backgroundImage: `url(${thumbnail})` }} />
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="52" viewBox="0 0 40 50">
            <path d="M20 0 C8.954 0 0 8.954 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 8.954 31.046 0 20 0 Z" fill="white" stroke="#3b3b3b" strokeWidth="1" />
        </svg>
    </div>
  );
}