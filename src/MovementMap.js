
import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function MovementMap() {
  const [map, setMap] = useState(null);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", address: "" });

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v11",
        center: [-98.5795, 39.8283],
        zoom: 4,
      });
      setMap(mapInstance);
    };
    initializeMap();
  }, []);

  useEffect(() => {
    const loadMovements = async () => {
      const querySnapshot = await getDocs(collection(db, "movements"));
      const data = querySnapshot.docs.map(doc => doc.data());
      setMovements(data);
    };
    loadMovements();
  }, []);

  useEffect(() => {
    if (map && movements.length > 0) {
      movements.forEach((m) => {
        new mapboxgl.Marker()
          .setLngLat([m.lng, m.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${m.name}</h3><p>${m.description}</p>`))
          .addTo(map);
      });
    }
  }, [map, movements]);

  const geocodeAddress = async (address) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    } else {
      throw new Error("Location not found");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { lat, lng } = await geocodeAddress(form.address);
      const newMovement = {
        name: form.name,
        description: form.description,
        lat,
        lng,
      };
      await addDoc(collection(db, "movements"), newMovement);
      setMovements([...movements, newMovement]);
      setForm({ name: "", description: "", address: "" });
    } catch (err) {
      alert("Could not find location: " + err.message);
    }
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-3">
      <div className="col-span-1 p-4 bg-white shadow-xl z-10">
        <h1 className="text-2xl font-bold mb-4">Add a Movement</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            className="p-2 border rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            className="p-2 border rounded"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            className="p-2 border rounded"
            placeholder="Address (e.g. NYC, 1600 Pennsylvania Ave, etc)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Submit Movement
          </button>
        </form>
      </div>
      <div id="map" className="col-span-2 h-full" />
    </div>
  );
}
