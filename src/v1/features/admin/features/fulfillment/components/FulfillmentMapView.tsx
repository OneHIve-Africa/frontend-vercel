/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { FulfillmentCenter } from "@/v1/api/FulfillmentApi";
import { useNavigate } from "react-router-dom";

interface FulfillmentMapViewProps {
  centers: FulfillmentCenter[];
}

declare global {
  interface Window {
    L: any;
  }
}

// Regional fallback coordinates in Ghana
const REGION_COORDINATES: Record<string, [number, number]> = {
  Ashanti: [7.3856, -1.3562],
  Volta: [7.1519, 0.4736],
  Eastern: [6.5833, -0.7333],
  Northern: [9.8242, -0.8333],
  Central: [5.5500, -1.2167],
  "Greater Accra": [5.6037, -0.1870],
  Western: [5.3000, -2.2000],
  Bono: [7.5833, -2.3333],
  "Bono East": [7.7500, -1.0500],
  Ahafo: [7.0000, -2.4000],
  "Upper East": [10.7856, -0.8514],
  "Upper West": [10.0601, -2.5099],
  Savannah: [9.0833, -1.8167],
  "North East": [10.5167, -0.3667],
  Oti: [7.9000, 0.3000],
  "Western North": [6.2000, -2.8000],
};

const FulfillmentMapView: React.FC<FulfillmentMapViewProps> = ({ centers }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<FulfillmentCenter | null>(null);
  const navigate = useNavigate();

  // Load Leaflet CSS and JS dynamically from CDN
  useEffect(() => {
    // Check if Leaflet CSS already in document
    const cssId = "leaflet-cdn-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Check if Leaflet JS is already loaded
    if (window.L) {
      setIsLeafletLoaded(true);
      return;
    }

    const scriptId = "leaflet-cdn-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setIsLeafletLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      // Script tag exists, poll until window.L is ready
      const checkInterval = setInterval(() => {
        if (window.L) {
          setIsLeafletLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Initialize and update the map once Leaflet is loaded
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || !window.L) return;

    // Destroy existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;

    // Center of Ghana
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([7.9465, -1.0232], 7);

    // OpenStreetMap tile layer CDN
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Custom Amber Honey Pin Icon
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="
          background: #f09443;
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
        ">
          🍯
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });

    // Add markers for centers
    const markerGroup = L.featureGroup();

    centers.forEach((center) => {
      let lat = center.latitude ? Number(center.latitude) : null;
      let lng = center.longitude ? Number(center.longitude) : null;

      if (!lat || !lng) {
        const fallback = REGION_COORDINATES[center.region] || [7.9465, -1.0232];
        lat = fallback[0];
        lng = fallback[1];
      }

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markerGroup.addLayer(marker);

      // Popup Content
      const popupHtml = `
        <div style="min-width: 200px; padding: 4px; font-family: sans-serif;">
          <div style="font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase;">
            ${center.code} • ${center.region}
          </div>
          <div style="font-size: 14px; font-weight: bold; color: #111; margin: 4px 0;">
            ${center.name}
          </div>
          <div style="font-size: 12px; color: #555; margin-bottom: 8px;">
            ${center.town ? `${center.town}, ` : ""}${center.district || ""}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: #fafafa; padding: 6px; border-radius: 6px; margin-bottom: 8px;">
            <div><strong>Farmers:</strong> ${center.attached_farmers_count}</div>
            <div><strong>Intake:</strong> ${Number(center.total_gallons_received).toLocaleString()} Gal</div>
          </div>
          <a
            href="/fulfillment/${center.id}"
            style="
              display: block;
              text-align: center;
              background: #f09443;
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 12px;
              font-weight: 600;
            "
          >
            Manage Center →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        setSelectedCenter(center);
      });
    });

    if (centers.length > 0) {
      try {
        map.fitBounds(markerGroup.getBounds().pad(0.15));
      } catch (e) {
        // Fallback zoom
        map.setView([7.9465, -1.0232], 7);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletLoaded, centers]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[540px] z-10"
        style={{ minHeight: "540px" }}
      />

      {/* Floating Center Details Overlay if selected */}
      {selectedCenter && (
        <div className="absolute top-4 right-4 z-20 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                {selectedCenter.code} • {selectedCenter.region}
              </span>
              <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                {selectedCenter.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedCenter(null)}
              className="text-gray-400 hover:text-gray-600 text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <p>Location: {selectedCenter.town || selectedCenter.district || selectedCenter.region}</p>
            {selectedCenter.manager_name && <p>Manager: {selectedCenter.manager_name}</p>}
            <p>Farmers: <strong>{selectedCenter.attached_farmers_count}</strong></p>
            <p>Volume: <strong>{Number(selectedCenter.total_gallons_received).toLocaleString()} Gallons</strong></p>
            <p>Farmer Gains: <strong className="text-emerald-600">GHS {Number(selectedCenter.total_farmer_payouts).toLocaleString()}</strong></p>
          </div>

          <button
            onClick={() => navigate(`/fulfillment/${selectedCenter.id}`)}
            className="w-full mt-3 py-2 bg-oha_primary text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition cursor-pointer"
          >
            Open Center Details
          </button>
        </div>
      )}
    </div>
  );
};

export default FulfillmentMapView;
