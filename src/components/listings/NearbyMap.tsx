'use client';

import { useEffect, useRef, useState } from 'react';
import { LocateFixed, Maximize2, Minus, Plus, RotateCcw, X } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';
import type { PublishedListing } from '@/lib/public-listings';
import 'leaflet/dist/leaflet.css';

type Point = Pick<PublishedListing, 'id'|'title'|'map_lat'|'map_lng'>;
const bangladesh: [number,number] = [23.78,90.34];

export default function NearbyMap({ points }: { points: Point[] }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [status,setStatus] = useState('');
  useEffect(() => {
    let active = true;
    let observer: ResizeObserver | undefined;
    void import('leaflet').then(L => {
      if (!active || !container.current) return;
      const map = L.map(container.current, { scrollWheelZoom:false, zoomControl:false }).setView(bangladesh,7);
      mapRef.current = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const bounds = L.latLngBounds([]);
      for (const point of points) {
        if (point.map_lat === null || point.map_lng === null) continue;
        const latLng: [number,number] = [point.map_lat,point.map_lng];
        const name = document.createElement('span');
        name.textContent = point.title;
        const link = document.createElement('a');
        link.textContent = 'পোস্ট দেখুন';
        link.href = '/posts/' + point.id;
        L.circleMarker(latLng, { color:'#fff2b5',weight:2, fillColor:'#ff6a00', fillOpacity:1, radius:8 })
          .addTo(map).bindTooltip(name, { permanent:true, direction:'top', offset:[0,-7] }).bindPopup(link);
        bounds.extend(latLng);
      }
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.15), { maxZoom:14 });
      observer = new ResizeObserver(() => map.invalidateSize({ pan:false }));
      observer.observe(container.current);
    }).catch(() => { if (active) setStatus('ম্যাপ এখন খোলা যাচ্ছে না। তালিকা থেকে ফলাফল দেখুন।'); });
    return () => { active = false; observer?.disconnect(); mapRef.current?.remove(); mapRef.current = null; };
  }, [points]);

  function locate() {
    if (!navigator.geolocation || !mapRef.current) { setStatus('এই ডিভাইসে ম্যাপের অবস্থান পাওয়া যাচ্ছে না।'); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const rounded: [number,number] = [Number(coords.latitude.toFixed(3)),Number(coords.longitude.toFixed(3))];
      mapRef.current?.setView(rounded,14);
      setStatus('ম্যাপটি ডিভাইসের কাছাকাছি এলাকায় সরানো হয়েছে। তালিকা নির্বাচিত জেলার ভিত্তিতে দেখানো হচ্ছে।');
    }, () => setStatus('অবস্থান পাওয়া যায়নি। জেলা বেছে নিতে পারেন।'), { timeout:8000, maximumAge:60_000 });
  }

  return <section className={expanded ? 'nearby-map nearby-map-expanded' : 'nearby-map'} aria-label="নিকটবর্তী ফলাফলের ম্যাপ">
    <div ref={container} className="nearby-map-surface" aria-label="বাংলাদেশের ম্যাপ" />
    <div className="nearby-map-buttons">
      <button aria-label="ম্যাপ জুম ইন" onClick={() => mapRef.current?.zoomIn()}><Plus /></button>
      <button aria-label="ম্যাপ জুম আউট" onClick={() => mapRef.current?.zoomOut()}><Minus /></button>
      <button aria-label="আমার অবস্থানে ম্যাপ সরান" onClick={locate}><LocateFixed /></button>
      <button aria-label="ম্যাপের ভিউ রিসেট করুন" onClick={() => mapRef.current?.setView(bangladesh,7)}><RotateCcw /></button>
      <button aria-label={expanded ? 'বড় ম্যাপ বন্ধ করুন' : 'বড় ম্যাপ দেখুন'} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? <X /> : <Maximize2 />}</button>
    </div>
    {status && <p role="status" className="nearby-map-status">{status}</p>}
  </section>;
}
