"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export type MapPoint = {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  color: string;
  label: string;
};

// Bounding box around the Bay Area: drops any coordinate the model got badly wrong.
const inBay = (p: MapPoint) => p.lat > 37.2 && p.lat < 38.2 && p.lng > -122.7 && p.lng < -121.7;

export default function PlanMap({ points }: { points: MapPoint[] }) {
  const pts = points.filter(inBay);
  const bounds = pts.length
    ? L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number])).pad(0.15)
    : L.latLngBounds([37.70, -122.52], [37.82, -122.36]);

  return (
    <MapContainer bounds={bounds} scrollWheelZoom={false} className="h-[460px] w-full rounded-2xl" style={{ zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="sfl-tiles"
      />
      {pts.map((p, i) => (
        <Marker
          key={i}
          position={[p.lat, p.lng]}
          icon={L.divIcon({
            className: "",
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            html: `<div style="width:28px;height:28px;border-radius:999px;background:${p.color};color:#fff;font:600 12px/28px Inter,system-ui;text-align:center;box-shadow:0 0 0 3px #fff,0 4px 10px rgba(0,0,0,.25)">${p.label}</div>`,
          })}
        >
          <Popup>
            <strong>{p.title}</strong>
            <br />
            {p.subtitle}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
