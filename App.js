import "./styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster"; // Ensure this is correct

import { Icon, divIcon, point } from "leaflet";

// create custom icon
const customIcon = new Icon({
  iconUrl: require("./map-marker.webp"),
  iconSize: [38, 38] // size of the icon
});

// custom cluster icon
const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

// markers
const markers = [
  {
    geocode: [34.23, 85.47],
    popUp: "Hello, I am pop up 1"
  },
  {
    geocode: [12.56, 48.93],
    popUp: "Hello, I am pop up 2"
  },
  {
    geocode: [67.89, 23.45],
    popUp: "Hello, I am pop up 3"
  },
  {
    geocode: [78.34, 59.21],
    popUp: "Hello, I am pop up 4"
  },
  {
    geocode: [91.22, 15.67],
    popUp: "Hello, I am pop up 5"
  },
  {
    geocode: [42.86, 73.13],
    popUp: "Hello, I am pop up 6"
  },
  {
    geocode: [57.39, 20.84],
    popUp: "Hello, I am pop up 7"
  },
  {
    geocode: [29.75, 99.58],
    popUp: "Hello, I am pop up 8"
  },
  {
    geocode: [88.12, 36.79],
    popUp: "Hello, I am pop up 9"
  },
  {
    geocode: [64.50, 47.32],
    popUp: "Hello, I am pop up 10"
  },
  {
    geocode: [37.7749, -122.4194],  // San Francisco, USA
    popUp: "Hello, I am pop up 11"
  },
  {
    geocode: [40.7128, -74.0060],   // New York City, USA
    popUp: "Hello, I am pop up 12"
  },
  {
    geocode: [45.4215, -75.6972],   // Ottawa, Canada
    popUp: "Hello, I am pop up 13"
  },
  {
    geocode: [19.4326, -99.1332],   // Mexico City, Mexico
    popUp: "Hello, I am pop up 14"
  },
  {
    geocode: [34.0522, -118.2437],  // Los Angeles, USA
    popUp: "Hello, I am pop up 15"
  },

  // South America
  {
    geocode: [-23.5505, -46.6333],  // São Paulo, Brazil
    popUp: "Hello, I am pop up 16"
  },
  {
    geocode: [-34.6037, -58.3816],  // Buenos Aires, Argentina
    popUp: "Hello, I am pop up 17"
  },
  {
    geocode: [-12.0464, -77.0428],  // Lima, Peru
    popUp: "Hello, I am pop up 18"
  },
  {
    geocode: [-33.4489, -70.6693],  // Santiago, Chile
    popUp: "Hello, I am pop up 19"
  },
  {
    geocode: [-0.1807, -78.4678],   // Quito, Ecuador
    popUp: "Hello, I am pop up 20"
  }, 
  {
    geocode: [34.0522, -118.2437],  // Los Angeles, USA
    popUp: "Hello, Los Angeles, USA"
  },
  {
    geocode: [40.7128, -74.0060],   // New York City, USA
    popUp: "Hello, New York City, USA"
  },
  {
    geocode: [41.8781, -87.6298],   // Chicago, USA
    popUp: "Hello, Chicago, USA"
  },
  {
    geocode: [29.7604, -95.3698],   // Houston, USA
    popUp: "Hello, Houston, USA"
  },
  {
    geocode: [47.6062, -122.3321],  // Seattle, USA
    popUp: "Hello, Seattle, USA"
  },

  // Russia
  {
    geocode: [55.7558, 37.6176],    // Moscow, Russia
    popUp: "Hello, Moscow, Russia"
  },
  {
    geocode: [59.9343, 30.3351],    // Saint Petersburg, Russia
    popUp: "Hello, Saint Petersburg, Russia"
  },
  {
    geocode: [56.3269, 44.0075],    // Nizhny Novgorod, Russia
    popUp: "Hello, Nizhny Novgorod, Russia"
  },
  {
    geocode: [55.7887, 49.1221],    // Kazan, Russia
    popUp: "Hello, Kazan, Russia"
  },
  {
    geocode: [52.5200, 103.8260],   // Irkutsk, Russia
    popUp: "Hello, Irkutsk, Russia"
  },

  // Australia
  {
    geocode: [-33.8688, 151.2093],  // Sydney, Australia
    popUp: "Hello, Sydney, Australia"
  },
  {
    geocode: [-37.8136, 144.9631],  // Melbourne, Australia
    popUp: "Hello, Melbourne, Australia"
  },
  {
    geocode: [-27.4698, 153.0251],  // Brisbane, Australia
    popUp: "Hello, Brisbane, Australia"
  },
  {
    geocode: [-31.9505, 115.8605],  // Perth, Australia
    popUp: "Hello, Perth, Australia"
  },
  {
    geocode: [-34.9285, 138.6007],  // Adelaide, Australia
    popUp: "Hello, Adelaide, Australia"
  },

  // Europe
  {
    geocode: [48.8566, 2.3522],     // Paris, France
    popUp: "Hello, Paris, France"
  },
  {
    geocode: [51.5074, -0.1278],    // London, United Kingdom
    popUp: "Hello, London, UK"
  },
  {
    geocode: [52.5200, 13.4050],    // Berlin, Germany
    popUp: "Hello, Berlin, Germany"
  },
  {
    geocode: [41.9028, 12.4964],    // Rome, Italy
    popUp: "Hello, Rome, Italy"
  },
  {
    geocode: [40.4168, -3.7038],    // Madrid, Spain
    popUp: "Hello, Madrid, Spain"
  }
];

export default function App() {
  return (
    <div className="arcade-screen">
      <MapContainer center={[48.8566, 2.3522]} zoom={3} maxZoom={18} minZoom={3}>
        {/* OPEN STREET MAP TILES */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {/* Mapping through the markers */}
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.geocode} icon={customIcon}>
              <Popup>{marker.popUp}</Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
