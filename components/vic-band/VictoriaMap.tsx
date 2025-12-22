"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import type { MusicianProfile, ProfessionalProfile } from "@shared/schema";

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

const greenIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function VictoriaMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);

    const { data: musicians } = useQuery<MusicianProfile[]>({
        queryKey: ["/api/musicians?hasLocation=true&limit=2000"],
    });

    const { data: professionals } = useQuery<ProfessionalProfile[]>({
        queryKey: ["/api/professionals?hasLocation=true&limit=2000"],
    });

    const musicianLocations = musicians?.filter(p => p.isLocationShared && p.latitude && p.longitude) || [];
    const professionalLocations = professionals?.filter(p => p.isLocationShared && p.latitude && p.longitude) || [];

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

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

        // Aggregate musicians by suburb
        const musicianSuburbMap = new Map<string, { lat: number; lng: number; count: number }>();
        musicianLocations.forEach(profile => {
            if (!profile.latitude || !profile.longitude) return;
            const suburb = profile.location?.trim();
            if (!suburb) return;

            const lat = parseFloat(profile.latitude);
            const lng = parseFloat(profile.longitude);

            if (isNaN(lat) || isNaN(lng)) return;

            if (musicianSuburbMap.has(suburb)) {
                const entry = musicianSuburbMap.get(suburb)!;
                entry.count += 1;
            } else {
                musicianSuburbMap.set(suburb, { lat, lng, count: 1 });
            }
        });

        // Aggregate professionals by suburb
        const proSuburbMap = new Map<string, { lat: number; lng: number; count: number }>();
        professionalLocations.forEach(profile => {
            if (!profile.latitude || !profile.longitude) return;
            const suburb = profile.location?.trim();
            if (!suburb) return;

            const lat = parseFloat(profile.latitude);
            const lng = parseFloat(profile.longitude);

            if (isNaN(lat) || isNaN(lng)) return;

            if (proSuburbMap.has(suburb)) {
                const entry = proSuburbMap.get(suburb)!;
                entry.count += 1;
            } else {
                proSuburbMap.set(suburb, { lat, lng, count: 1 });
            }
        });

        // Add Musician Markers (Blue)
        musicianSuburbMap.forEach((data, suburb) => {
            const marker = L.marker([data.lat, data.lng], { icon: defaultIcon });
            const tooltipContent = `${suburb} (${data.count} musician${data.count > 1 ? 's' : ''})`;
            marker.bindTooltip(tooltipContent, { permanent: false, direction: 'top' });
            marker.addTo(markersLayerRef.current!);
        });

        // Add Professional Markers (Green)
        // If a suburb has both, we slightly offset the professional marker so both are visible
        proSuburbMap.forEach((data, suburb) => {
            let lat = data.lat;
            let lng = data.lng;

            // Simple offset if collision
            if (musicianSuburbMap.has(suburb)) {
                lat += 0.005; // Roughly 500m offset
                lng += 0.005;
            }

            const marker = L.marker([lat, lng], { icon: greenIcon });
            const tooltipContent = `${suburb} (${data.count} professional${data.count > 1 ? 's' : ''})`;
            marker.bindTooltip(tooltipContent, { permanent: false, direction: 'top' });
            marker.addTo(markersLayerRef.current!);
        });

    }, [musicianLocations, professionalLocations]);

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-sm z-0 relative">
            <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
        </div>
    );
}
