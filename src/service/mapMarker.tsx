import type { CanvasMap } from "./canvasMap";

export interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  thumbnail?: string;
}

export class MapMarker {
  private location: MapLocation;
  private map: CanvasMap;
  private locationImage: HTMLImageElement;
  private readonly MARKER_SIZE = 50; // Fixed marker size in pixels
  private readonly PIN_HEIGHT = 6; // Height of the pin point
  private loaded: boolean = false;

  constructor(map: CanvasMap, location: MapLocation) {
    this.map = map;
    this.location = location;
    this.locationImage = new Image();
    this.locationImage.src = this.location.thumbnail || '';
    
    this.locationImage.onload = this.handleImageLoad.bind(this);    
  }

  handleImageLoad() {
    this.loaded = true;
    this.render();
  }

  render() {
    const screenPos = {
      x: this.location.x * this.map.scale * this.map.zoom + this.map.coordinates.x,
      y: this.location.y * this.map.scale * this.map.zoom + this.map.coordinates.y
    };
    
    // Don't draw if off-screen (optimization)
    if (screenPos.x < -this.MARKER_SIZE || screenPos.x > this.map.canvas.width + this.MARKER_SIZE ||
        screenPos.y < -this.MARKER_SIZE || screenPos.y > this.map.canvas.height + this.MARKER_SIZE) {
      return;
    }

    const ctx = this.map.context;
    const markerRadius = this.MARKER_SIZE / 2;
    const markerColor = '#fff';

    // Draw pin point (triangle pointing down)
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    
    ctx.beginPath();
    ctx.moveTo(0, 0); // Point
    ctx.lineTo(-6, -this.PIN_HEIGHT); // Left
    ctx.lineTo(6, -this.PIN_HEIGHT); // Right
    ctx.closePath();
    ctx.fillStyle = markerColor;
    ctx.fill();

    // Draw circular marker above the pin
    ctx.beginPath();
    ctx.arc(0, -this.PIN_HEIGHT - markerRadius, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = markerColor;
    ctx.fill();


    // If there's a thumbnail, draw it (simplified - you could load actual images)
    if (this.location.thumbnail) {

      if (this.loaded) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -this.PIN_HEIGHT - markerRadius, markerRadius - 2, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw thumbnail, centered and cropped to fit circle
        const thumbSize = (markerRadius - 2) * 2;
        ctx.drawImage(
          this.locationImage,
          -thumbSize / 2,
          -this.PIN_HEIGHT - markerRadius - thumbSize / 2,
          thumbSize,
          thumbSize
        );
        
        ctx.restore();
      } else {
        // Draw a placeholder circle for now
        ctx.beginPath();
        ctx.arc(0, -this.PIN_HEIGHT - markerRadius, markerRadius - 4, 0, Math.PI * 2);
        ctx.fillStyle = '#cccccc';
        ctx.fill();
        
        // You could load and draw actual thumbnail images here
        // For now, just draw initials
        ctx.fillStyle = '#333333';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.location.name.charAt(0).toUpperCase(), 0, -this.PIN_HEIGHT - markerRadius);
      }
    }

    ctx.restore();
  }
}