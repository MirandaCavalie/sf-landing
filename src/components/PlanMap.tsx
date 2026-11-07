"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export type MapPoint = {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  color: string;
  label?: string; // numbered pin for plan stops
  size?: number; // event bubble diameter in px
  url?: string;
};

// Bounding box around the Bay Area: drops any coordinate that is clearly wrong.
const inBay = (p: MapPoint) => p.lat > 37.2 && p.lat < 38.2 && p.lng > -122.7 && p.lng < -121.7;

function icon(p: MapPoint) {
  if (p.label) {
    return L.divIcon({
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: `<div style="width:28px;height:28px;border-radius:999px;background:${p.color};color:#fff;font:600 12px/28px Inter,system-ui;text-align:center;box-shadow:0 0 0 3px #fff,0 4px 10px rgba(0,0,0,.25)">${p.label}</div>`,
    });
  }
  const s = p.size ?? 14;
  return L.divIcon({
    className: "",
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    html: `<div style="width:${s}px;height:${s}px;border-radius:999px;background:${p.color};opacity:.55;box-shadow:0 0 0 2px rgba(255,255,255,.9)"></div>`,
  });
}

// Leaflet measures its container once; when the tab re-mounts mid-layout it can measure wrong and
// render only part of the tiles. Re-measure right after mount and on resize.
function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t = [50, 300, 800].map((ms) => setTimeout(() => map.invalidateSize(), ms));
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => {
      t.forEach(clearTimeout);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

export default function PlanMap({ points }: { points: MapPoint[] }) {
  const pts = points.filter(inBay);
  // Frame San Francisco proper; South Bay / East Bay events are one zoom-out away.
  const bounds = L.latLngBounds([37.705, -122.515], [37.812, -122.385]);

  return (
    <MapContainer bounds={bounds} scrollWheelZoom={false} className="h-[480px] w-full rounded-2xl" style={{ zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="sfl-tiles"
      />
      <FixSize />
      {/* events first so plan pins sit on top */}
      {[...pts].sort((a, b) => Number(!!a.label) - Number(!!b.label)).map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={icon(p)} zIndexOffset={p.label ? 1000 : 0}>
          <Popup>
            <strong>{p.title}</strong>
            <br />
            {p.subtitle}
            {p.url && (
              <>
                <br />
                <a href={p.url} target="_blank" rel="noreferrer">
                  Open event ↗
                </a>
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
