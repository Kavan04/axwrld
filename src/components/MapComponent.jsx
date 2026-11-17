import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import RecipeForm from '../RecipeForm';
import 'leaflet/dist/leaflet.css';

function MapComponent() {
    const [showForm, setShowForm] = useState(false);
    const [markerPosition, setMarkerPosition] = useState(null);

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setMarkerPosition(e.latlng);
                setShowForm(true);
            }
        });
        return null;
    }

    const submitRecipe = async (formData) => {
        try {
            const response = await axios.post('http://localhost:5000/recipes', {...formData, location: markerPosition});
            console.log('Recipe created:', response.data);
            setShowForm(false); // Close form on successful submission
            setMarkerPosition(null); // Optionally reset marker position
        } catch (error) {
            console.error('Failed to post recipe', error);
            // Optionally update the UI here to show an error message
        }
    };

    return (
        <div>
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
            </MapContainer>
            {showForm && (
                <RecipeForm
                    onSubmit={submitRecipe}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
}

export default MapComponent;



