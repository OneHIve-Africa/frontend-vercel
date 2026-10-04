/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Search,
  Navigation,
  CheckCircle2,
  Building2,
  Info,
  Loader2,
} from "lucide-react";
import FulfillmentApi, { FulfillmentCenter } from "@/v1/api/FulfillmentApi";
import toast from "react-hot-toast";

interface CreateCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCenter: FulfillmentCenter) => void;
}

// 16 Regions of Ghana with 3-letter codes and approximate regional centers
const GHANA_REGIONS: Record<string, { code: string; coords: [number, number] }> = {
  Ashanti: { code: "ASH", coords: [6.6885, -1.6244] },
  Volta: { code: "VOL", coords: [6.6100, 0.4700] },
  Eastern: { code: "EAS", coords: [6.0945, -0.2608] },
  Northern: { code: "NOR", coords: [9.4008, -0.8393] },
  Central: { code: "CEN", coords: [5.5500, -1.2167] },
  "Greater Accra": { code: "GAR", coords: [5.6037, -0.1870] },
  Western: { code: "WES", coords: [5.3000, -2.2000] },
  Bono: { code: "BON", coords: [7.3333, -2.3167] },
  "Bono East": { code: "BOE", coords: [7.7500, -1.0500] },
  Ahafo: { code: "AHF", coords: [7.0000, -2.4000] },
  "Upper East": { code: "UEA", coords: [10.7856, -0.8514] },
  "Upper West": { code: "UWE", coords: [10.0601, -2.5099] },
  Savannah: { code: "SAV", coords: [9.0833, -1.8167] },
  "North East": { code: "NEA", coords: [10.5167, -0.3667] },
  Oti: { code: "OTI", coords: [7.9000, 0.3000] },
  "Western North": { code: "WNO", coords: [6.2000, -2.8000] },
};

const computeCenterCode = (
  region: string,
  district: string = "",
  number: number | string = 1
): string => {
  const regCode =
    GHANA_REGIONS[region]?.code ||
    (region ? region.substring(0, 3).toUpperCase() : "GHA");

  const cleanDist = (district || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const distCode =
    cleanDist.length >= 3
      ? cleanDist.substring(0, 3)
      : cleanDist.length > 0
      ? cleanDist.padEnd(3, "X")
      : "CTR";

  const numVal = Math.max(1, Number(number) || 1);
  const numPad = String(numVal).padStart(2, "0");
  return `FC-${regCode}-${distCode}-${numPad}`;
};

const CreateCenterModal: React.FC<CreateCenterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [centerNumber, setCenterNumber] = useState<number>(1);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    region: "Ashanti",
    district: "",
    town: "",
    address: "",
    landmark: "",
    latitude: 6.6885,
    longitude: -1.6244,
    manager_name: "",
    manager_phone: "",
    manager_email: "",
    status: "active" as "active" | "maintenance" | "inactive",
    notes: "",
  });

  // Map and Geolocation state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // Search places state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Recalculate auto-generated code whenever region, district, or centerNumber changes
  useEffect(() => {
    const code = computeCenterCode(formData.region, formData.district, centerNumber);
    setGeneratedCode(code);
  }, [formData.region, formData.district, centerNumber]);

  // Dynamically load Leaflet CDN if not yet present
  useEffect(() => {
    if (!isOpen) return;

    const cssId = "leaflet-cdn-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      setIsLeafletReady(true);
      return;
    }

    const scriptId = "leaflet-cdn-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setIsLeafletReady(true);
      document.body.appendChild(script);
    }
  }, [isOpen]);

  // Helper to place or move marker on Leaflet map
  const placeMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    const pinIcon = L.divIcon({
      className: "custom-center-pin",
      html: `
        <div style="
          background: #f09443;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); font-size: 14px; line-height: 1;">🍯</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(mapInstanceRef.current);

      markerRef.current.on("dragend", (e: any) => {
        const newPos = e.target.getLatLng();
        handleCoordinatesSelected(newPos.lat, newPos.lng, true);
      });
    }
  };

  // Initialize map when modal is open and Leaflet is ready
  useEffect(() => {
    if (!isOpen || !isLeafletReady || !mapContainerRef.current) return;

    // Small delay to allow modal DOM layout to settle
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      const L = window.L;
      const initialLat = formData.latitude || 6.6885;
      const initialLng = formData.longitude || -1.6244;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([initialLat, initialLng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      placeMarker(initialLat, initialLng);

      // Click on map to drop / move pin
      map.on("click", (e: any) => {
        handleCoordinatesSelected(e.latlng.lat, e.latlng.lng, true);
      });

      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, isLeafletReady]);

  // Handle coordinates selection (from click, device location, or search)
  const handleCoordinatesSelected = async (
    lat: number,
    lng: number,
    fetchAddress = true
  ) => {
    const cleanLat = Number(Number(lat).toFixed(6));
    const cleanLng = Number(Number(lng).toFixed(6));

    setFormData((prev) => ({
      ...prev,
      latitude: cleanLat,
      longitude: cleanLng,
    }));

    if (mapInstanceRef.current) {
      placeMarker(cleanLat, cleanLng);
    }

    if (fetchAddress) {
      await reverseGeocode(cleanLat, cleanLng);
    }
  };

  // Reverse geocoding from OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        setFormData((prev) => {
          const addr = data.address || {};
          const townVal =
            addr.town || addr.village || addr.city || addr.suburb || prev.town;
          const distVal =
            addr.county || addr.district || addr.municipality || prev.district;

          return {
            ...prev,
            address: data.display_name,
            town: prev.town ? prev.town : townVal || "",
            district: prev.district ? prev.district : distVal || "",
          };
        });
      }
    } catch (err) {
      console.warn("Reverse geocode could not complete:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Search for places across Ghana
  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setShowSearchResults(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=gh&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (!res.ok) throw new Error("Search service unavailable");
      const results = await res.json();
      setSearchResults(results || []);
      if (!results || results.length === 0) {
        toast.error("No locations found in Ghana for that search");
      }
    } catch (err) {
      console.error("Location search failed", err);
      toast.error("Could not fetch location results");
    } finally {
      setIsSearching(false);
    }
  };

  // Select a search result
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14);
    }

    // Set address directly from search result display_name
    setFormData((prev) => ({
      ...prev,
      address: result.display_name,
      town: prev.town || result.address?.town || result.address?.city || "",
    }));

    handleCoordinatesSelected(lat, lng, false);
    setShowSearchResults(false);
    setSearchQuery("");
    toast.success("Location pinned from search");
  };

  // Use Device Location via HTML5 Geolocation
  const handlePickDeviceLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
        handleCoordinatesSelected(latitude, longitude, true);
        toast.success("Device location captured");
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Unable to retrieve location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // When Region dropdown changes, pan map to regional default
  const handleRegionChange = (newRegion: string) => {
    setFormData((prev) => ({ ...prev, region: newRegion }));
    const regMeta = GHANA_REGIONS[newRegion];
    if (regMeta && mapInstanceRef.current) {
      mapInstanceRef.current.setView(regMeta.coords, 10);
      handleCoordinatesSelected(regMeta.coords[0], regMeta.coords[1], true);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Center name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const codeToSend =
        generatedCode ||
        computeCenterCode(formData.region, formData.district, centerNumber);

      const payload = {
        name: formData.name.trim(),
        code: codeToSend,
        region: formData.region,
        district: formData.district.trim(),
        town: formData.town.trim(),
        address: formData.address.trim(),
        landmark: formData.landmark.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        manager_name: formData.manager_name.trim(),
        manager_phone: formData.manager_phone.trim(),
        manager_email: formData.manager_email.trim() || undefined,
        capacity_gallons: null, // Dynamic, uncapped
        status: formData.status,
        notes: formData.notes.trim(),
      };

      const res = await FulfillmentApi.getInstance().createCenter(payload);

      if (res.data) {
        toast.success(`Fulfillment center "${formData.name}" added successfully`);
        onSuccess(res.data);
        onClose();
      } else {
        toast.error("Failed to create fulfillment center");
      }
    } catch (err: any) {
      toast.error(
        err?.error || err?.detail || "Error creating fulfillment center"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-oha_primary">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Add Fulfillment Center
              </h3>
              <p className="text-xs text-gray-500">
                Configure regional collection, processing, and traceability hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 text-xs text-gray-700 overflow-y-auto flex-1"
        >
          {/* 1. Basic Details */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Center Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ashanti Regional Processing Hub"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
            </div>

            {/* Region & District & Town */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs text-gray-900"
                >
                  {Object.keys(GHANA_REGIONS).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ejura-Sekyedumase"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Town / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ejura"
                  value={formData.town}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
                />
              </div>
            </div>

            {/* 2. System Generated Center Code */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Center Code (System Generated)
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                      Auto-generated
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="font-mono text-base font-bold text-gray-900 bg-white px-2.5 py-0.5 rounded border border-stone-300 shadow-2xs">
                      {generatedCode || "FC-ASH-CTR-01"}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Derived from Region ({GHANA_REGIONS[formData.region]?.code || "ASH"}), District (
                      {(formData.district || "CTR").substring(0, 3).toUpperCase()}), & Hub #{centerNumber}
                    </span>
                  </div>
                </div>

                {/* Assigned Hub Number Stepper */}
                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
                    Hub #:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setCenterNumber((prev) => Math.max(1, prev - 1))}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-mono font-bold text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={centerNumber}
                      onChange={(e) =>
                        setCenterNumber(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-10 text-center text-xs font-mono font-bold border-x border-gray-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCenterNumber((prev) => prev + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-mono font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Landmark & Physical Address */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Near the Chief's Palace, beside the Central Market"
                value={formData.landmark}
                onChange={(e) =>
                  setFormData({ ...formData, landmark: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                Optional landmark to help field officers and farmers easily locate the hub.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-gray-700">
                  Address (Transferred from Map or Entered Manually)
                </label>
                {isGeocoding && (
                  <span className="flex items-center text-[11px] text-oha_primary space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Resolving address...</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="Physical address (populated automatically when you search or drop a pin on the map)"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
            </div>
          </div>

          {/* 4. Interactive Map & Pin Selection */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block font-medium text-gray-800">
                  Pin Location on Map
                </label>
                <p className="text-[11px] text-gray-500">
                  Search a place, tap the device location, or click anywhere on the map to pin.
                </p>
              </div>

              {/* Action: Use Device Location */}
              <button
                type="button"
                onClick={handlePickDeviceLocation}
                disabled={isLocating}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition cursor-pointer self-start sm:self-center"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-oha_primary" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-oha_primary" />
                )}
                <span>{isLocating ? "Locating..." : "Use device location"}</span>
              </button>
            </div>

            {/* Map Search Bar */}
            <div className="relative">
              <div className="flex items-center space-x-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search place, town or market on the map (e.g. Ejura, Kumasi, Hohoe)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchLocation();
                      }
                    }}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900 bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchLocation()}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-medium transition disabled:opacity-50 cursor-pointer"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 border-b border-gray-100 last:border-b-0 flex items-start space-x-2 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-oha_primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">
                          {res.display_name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Lat: {Number(res.lat).toFixed(4)}, Lon: {Number(res.lon).toFixed(4)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Embedded Map Container */}
            <div className="relative w-full h-56 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-gray-700 shadow-2xs pointer-events-none border border-gray-200">
                Tap anywhere on the map to place or reposition pin
              </div>
            </div>

            {/* Latitude and Longitude Display & Manual Input */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-medium text-gray-600 mb-0.5 text-[11px]">
                  Latitude (GPS)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleCoordinatesSelected(
                      parseFloat(e.target.value) || 0,
                      formData.longitude,
                      false
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-0.5 text-[11px]">
                  Longitude (GPS)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleCoordinatesSelected(
                      formData.latitude,
                      parseFloat(e.target.value) || 0,
                      false
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 5. Manager Information & Status */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 text-xs">
              Operations & Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Manager Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kwame Mensah"
                  value={formData.manager_name}
                  onChange={(e) =>
                    setFormData({ ...formData, manager_name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Manager Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +233 24 123 4567"
                  value={formData.manager_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, manager_phone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Manager Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. hub.ashanti@onehive.com"
                  value={formData.manager_email}
                  onChange={(e) =>
                    setFormData({ ...formData, manager_email: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Operational Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs text-gray-900"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Dynamic Capacity Notice (Uncapped) */}
              <div className="flex items-center px-3 py-2 bg-stone-50 border border-stone-200 rounded">
                <Info className="w-4 h-4 text-stone-500 mr-2 shrink-0" />
                <div className="text-[11px] text-stone-600">
                  <span className="font-semibold text-stone-800">
                    Capacity: Dynamic & Uncapped
                  </span>
                  <p className="text-[10px] text-stone-500">
                    Volume scales automatically based on honey intake records.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Notes / Operational Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Additional notes about facilities, road accessibility, or local cooperative partners..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-oha_primary hover:bg-orange-500 text-white text-xs font-medium rounded-full px-6 py-2 transition disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Creating..." : "Save fulfillment center"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCenterModal;
