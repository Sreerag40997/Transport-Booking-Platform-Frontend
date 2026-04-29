'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function BusTrackingMap({ liveData }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !liveData?.latitude || !liveData?.longitude) return;

    const position = [liveData.latitude, liveData.longitude];

    // Create map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: position,
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    const busSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a78bfa" width="40" height="40"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 6c0-1.08 1.18-1.5 7-1.5s7 .42 7 1.5v5H5V6z"/></svg>`;
    const busIcon = L.divIcon({
      html: `<div style="width:40px;height:40px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))">${decodeURIComponent(busSvg.replace(/%23/g, '#').replace(/<svg/, '<svg style="width:40px;height:40px"'))}</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.marker(position, { icon: busIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div style="font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em">
            <strong>VESSEL STATUS: ACTIVE</strong><br/>
            LAT: ${liveData.latitude.toFixed(4)}<br/>
            LNG: ${liveData.longitude.toFixed(4)}<br/>
            SPD: ${Math.floor(liveData.speed_kmh || 0)} KM/H
          </div>`
        );
    }

    mapInstanceRef.current.setView(position, 12);

    return () => {};
  }, [liveData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  if (!liveData?.latitude || !liveData?.longitude) {
    return (
      <div className="w-full h-[500px] bg-surface-container-high animate-pulse flex items-center justify-center">
        <p className="text-outline font-label uppercase text-xs tracking-widest">Acquiring GPS Signal...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] relative editorial-shadow border border-outline-variant/10">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
