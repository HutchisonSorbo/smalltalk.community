"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import type { MusicianProfile } from "@shared/schema";

// Fix Leaflet's default icon path issues
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

const CENTER: [number, number] = [-37.4713, 144.7852];
const ZOOM = 7;

export default function VictoriaMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);

    const { data: profiles } = useQuery<MusicianProfile[]>({
        // Fetch a large number of profiles to ensure we show everyone on the map
        // The default limit of 12 was hiding users who weren't in the first page
        queryKey: ["/api/musicians?hasLocation=true&limit=2000"],
    });

    const locations = profiles?.filter(p => p.isLocationShared && p.latitude && p.longitude) || [];

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return; // Prevention

        const map = L.map(mapContainerRef.current).setView(CENTER, ZOOM);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markersLayerRef.current = null;
        };
    }, []);

    // Update Markers
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();

        // Aggregate profiles by suburb to show a single marker per suburb with count tooltip
        const suburbMap = new Map<string, { lat: number; lng: number; count: number }>();
        locations.forEach(profile => {
            if (!profile.latitude || !profile.longitude) return;
            const suburb = profile.location?.trim();
            if (!suburb) return;

            // Debug specific coordinates
            // Debug specific coordinates
            // (Removed)

            const lat = parseFloat(profile.latitude);
            const lng = parseFloat(profile.longitude);

            if (isNaN(lat) || isNaN(lng)) {
                console.error("VictoriaMap: Invalid coordinates for", suburb, profile.latitude, profile.longitude);
                return;
            }

            if (suburbMap.has(suburb)) {
                const entry = suburbMap.get(suburb)!;
                entry.count += 1;
            } else {
                suburbMap.set(suburb, { lat, lng, count: 1 });
            }
        });

        suburbMap.forEach((data, suburb) => {
            const marker = L.marker([data.lat, data.lng], { icon: defaultIcon });
            const tooltipContent = `${suburb} (${data.count} musician${data.count > 1 ? 's' : ''})`;
            marker.bindTooltip(tooltipContent, { permanent: false, direction: 'top' });
            marker.addTo(markersLayerRef.current!);
        });
    }, [locations]);

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-sm z-0 relative">
            <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
        </div>
    );
}
