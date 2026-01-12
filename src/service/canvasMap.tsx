import { MapMarker } from "./mapMarker";

export interface MapLocation {
  id: string;
  x: number; // X coordinate on the original map image (in pixels or 0-1 normalized)
  y: number; // Y coordinate on the original map image
  name: string;
  thumbnail?: string; // Optional thumbnail image URL
}

interface Coordinates {
  x: number;
  y: number;
}

export class CanvasMap {
  context: CanvasRenderingContext2D;
  coordinates: Coordinates;
  scale: number = 1.0;
  zoom: number = 1.0;
  canvas: HTMLCanvasElement;

  private mapImage: HTMLImageElement;
  private dpr: number;
  private panX: number = 0;
  private panY: number = 0;
  
  private readonly MIN_ZOOM = 1.0;
  private readonly MAX_ZOOM = 3.0;
  private readonly ZOOM_SPEED = 0.2;

  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  private locations: MapMarker[] = [];
  private readonly MARKER_SIZE = 40; // Fixed marker size in pixels
  private readonly PIN_HEIGHT = 12; // Height of the pin point

  constructor(canvas: HTMLCanvasElement, mapSrc: string) {
    console.log(`Initializing CanvasMap with image source: ${mapSrc}`);
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  
    // Handle high-DPI displays
    this.dpr = window.devicePixelRatio || 1;
    this.context.scale(this.dpr, this.dpr);
    this.resizeCanvas();
    
    // Enable smoothing
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';
    this.mapImage = new Image();
    this.mapImage.src = mapSrc;
    this.mapImage.onload = this.handleImageLoad.bind(this);
    this.coordinates = { x: 0, y: 0 };

    // Event listeners
    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this)); // Stop dragging if mouse leaves canvas
    
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));    
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
  }

  // Add locations to the map
  addLocations(locations: MapLocation[]) {
    this.locations = [...this.locations, ...locations.map((location) => new MapMarker(this, location))];
    this.render();
  }

  // Clear all locations
  clearLocations() {
    this.locations = [];
    this.render();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;    
  }

  render() {
    const imageAspect = this.mapImage.width / this.mapImage.height;
    const containerAspect = this.canvas.width / this.canvas.height;
    
    let baseWidth, baseHeight;
    
    if (imageAspect > containerAspect) {
      // Image is wider - fit to height, crop width
      baseHeight = this.canvas.height;
      baseWidth = this.canvas.height * imageAspect;
    } else {
      // Image is taller - fit to width, crop height
      baseWidth = this.canvas.width;
      baseHeight = this.canvas.width / imageAspect;
    }

    const height = baseHeight * this.zoom;
    const width = baseWidth * this.zoom;
    
    // Center it
    let x = (this.canvas.width - width) / 2 + this.panX;
    let y = (this.canvas.height - height) / 2 + this.panY;

    if (x > 0) x = 0;
    if (y > 0) y = 0;
    if (x + width < this.canvas.width) x = this.canvas.width - width;
    if (y + height < this.canvas.height) y = this.canvas.height - height;

    this.coordinates = { x, y };
    this.scale = baseWidth / this.mapImage.width;

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw the map image
    this.context.drawImage(this.mapImage, x, y, width, height);
    // Draw all markers
    this.locations.forEach(location => location.render());
  }

  handleWheel(e: WheelEvent) {
    e.preventDefault();

    const oldZoom = this.zoom;
    const delta = e.deltaY > 0 ? -this.ZOOM_SPEED : this.ZOOM_SPEED;
    this.zoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom + delta));
    
    if (oldZoom !== this.zoom) {
      
      if (this.zoom === this.MIN_ZOOM) {
        this.panX = 0;
        this.panY = 0;
      } else {
        const rect = this.canvas.getBoundingClientRect();
        
        // Convert mouse position to canvas internal coordinates
        const canvasCenterX = this.canvas.width / 2;
        const canvasCenterY = this.canvas.height / 2;
        
        // Mouse position relative to canvas center, in canvas coordinates
        const mouseX = ((e.clientX - rect.left) / rect.width) * this.canvas.width - canvasCenterX;
        const mouseY = ((e.clientY - rect.top) / rect.height) * this.canvas.height - canvasCenterY;

        const zoomFactor = this.zoom / oldZoom;
        
        this.panX = mouseX - (mouseX - this.panX) * zoomFactor;
        this.panY = mouseY - (mouseY - this.panY) * zoomFactor;
      }
      
      this.updateCursor();
      console.log(`Zoom: ${(this.zoom * 100).toFixed(0)}%`, `PanX: ${this.panX.toFixed(2)}`, `PanY: ${this.panY.toFixed(2)}`);
      
      this.render();
    }
  }

  updateCursor() {
    this.canvas.style.cursor = this.zoom > this.MIN_ZOOM ? 'grab' : 'default';
  }

  handleMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.canvas.style.cursor = 'grabbing';
  }

  handleMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      
      // Convert CSS pixel delta to canvas coordinate delta
      const deltaX = ((e.clientX - this.lastMouseX) / rect.width) * this.canvas.width;
      const deltaY = ((e.clientY - this.lastMouseY) / rect.height) * this.canvas.height;
      
      this.panX += deltaX;
      this.panY += deltaY;
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      
      this.render();
    }
  }

  handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.updateCursor();
    }
  }


  handleResize = () => {
    this.resizeCanvas();
    this.render();
  }

  handleImageLoad = () => this.render()
}