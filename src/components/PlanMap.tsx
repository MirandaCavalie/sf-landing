"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

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

const STYLE = "https://tiles.openfreemap.org/styles/positron";
const SF_BOUNDS: [[number, number], [number, number]] = [[-122.515, 37.705], [-122.385, 37.812]];

// Subtle brand tint + 3D buildings. Wrapped in try/catch per layer: style layer names may change.
function restyle(map: maplibregl.Map) {
  const style = map.getStyle();
  for (const l of style.layers ?? []) {
    try {
      if (l.type === "background") map.setPaintProperty(l.id, "background-color", "#f6f4f0");
      else if (l.type === "fill" && /water/.test(l.id)) map.setPaintProperty(l.id, "fill-color", "#dbe6ea");
      else if (l.type === "line" && /aeroway|rail|ferry|transit/.test(l.id)) map.setLayoutProperty(l.id, "visibility", "none");
      else if (l.type === "symbol" && /(bus|ferry|transit|rail)/.test(l.id)) map.setLayoutProperty(l.id, "visibility", "none");
    } catch {}
  }
  try {
    const bld = style.layers?.find((l: maplibregl.LayerSpecification) => l.type === "fill" && /building/.test(l.id)) as
      | (maplibregl.LayerSpecification & { source?: string; "source-layer"?: string })
      | undefined;
    if (bld?.source && bld["source-layer"]) {
      map.addLayer(
        {
          id: "sfl-buildings-3d",
          type: "fill-extrusion",
          source: bld.source,
          "source-layer": bld["source-layer"],
          minzoom: 14,
          paint: {
            "fill-extrusion-color": "#d9d6d0",
            "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
            "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
            "fill-extrusion-opacity": 0.55,
          },
        },
        bld.id,
      );
    }
  } catch {}
}

function markerEl(p: MapPoint): HTMLElement {
  const el = document.createElement("div");
  if (p.label) {
    el.style.cssText = `width:28px;height:28px;border-radius:999px;background:${p.color};color:#fff;font:600 12px/28px Inter,system-ui,sans-serif;text-align:center;box-shadow:0 0 0 3px #fff,0 4px 10px rgba(0,0,0,.28);cursor:pointer`;
    el.textContent = p.label;
  } else {
    const s = p.size ?? 14;
    el.className = "sfl-bubble";
    el.style.cssText = `width:${s}px;height:${s}px;border-radius:999px;background:${p.color};opacity:.55;box-shadow:0 0 0 2px rgba(255,255,255,.9),0 0 ${Math.round(s / 2)}px ${p.color};cursor:pointer`;
  }
  return el;
}

function popupNode(p: MapPoint): HTMLElement {
  const box = document.createElement("div");
  const t = document.createElement("strong");
  t.textContent = p.title;
  box.append(t, document.createElement("br"), document.createTextNode(p.subtitle));
  if (p.url) {
    box.append(document.createElement("br"));
    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = "Open event ↗";
    box.append(a);
  }
  return box;
}

export default function PlanMap({ points }: { points: MapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Create the map once; destroy on unmount.
  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE,
      bounds: SF_BOUNDS,
      fitBoundsOptions: { padding: 10 },
      pitch: 40,
      cooperativeGestures: true,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => restyle(map));
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(ref.current);
    const timers = [50, 300, 800].map((ms) => setTimeout(() => map.resize(), ms));
    mapRef.current = map;
    return () => {
      timers.forEach(clearTimeout);
      ro.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers when points change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    // events first so plan pins sit on top (later DOM order wins)
    markersRef.current = points
      .filter(inBay)
      .sort((a, b) => Number(!!a.label) - Number(!!b.label))
      .map((p) => {
        const marker = new maplibregl.Marker({ element: markerEl(p) })
          .setLngLat([p.lng, p.lat])
          .setPopup(new maplibregl.Popup({ offset: p.label ? 18 : (p.size ?? 14) / 2 + 4, maxWidth: "260px" }).setDOMContent(popupNode(p)))
          .addTo(map);
        if (p.label) marker.getElement().style.zIndex = "2";
        return marker;
      });
  }, [points]);

  return <div ref={ref} className="h-[480px] w-full overflow-hidden rounded-2xl" style={{ zIndex: 0 }} />;
}
