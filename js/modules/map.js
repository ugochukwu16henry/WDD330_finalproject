// js/modules/map.js
mapboxgl.accessToken = 'pk.eyJ1IjoidWdvY2h1a3d1aGVucnkiLCJhIjoiY21pZzIyMHNkMDJ1cDNkcGg4MWNiNzZ1aCJ9.B5zh9ZhrswY_vyz_vs_xHw';

let map;
let userMarker;
let markers = []; // Store all markers so we can remove them properly

const defaultCenter = [-74.0059, 40.7128]; // Default: New York (will change to user)

function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: defaultCenter,
    zoom: 10
  });

  // Add geocoder (search box)
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: 'Search for a city...'
  });
  map.addControl(geocoder, 'top-left');

  // Add geolocation control
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    })
  );

  // Load saved locations
  loadSavedLocations();

  // Wait for map to load before adding event listeners
  map.on('load', () => {
    // Load providers on map load
    addNearbyProviders(...defaultCenter);

    // Custom event listeners - set up after map loads
    const searchBtn = document.getElementById('search-btn');
    const geoBtn = document.getElementById('geolocate-btn');
    const locationInput = document.getElementById('location-input');

    if (searchBtn && locationInput) {
      searchBtn.addEventListener('click', () => {
        const query = locationInput.value.trim();
        if (query) {
          searchBtn.disabled = true;
          searchBtn.textContent = 'Searching...';
          
          // Use Mapbox Geocoding API directly
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
              searchBtn.disabled = false;
              searchBtn.textContent = 'Search Location';
              
              if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                map.flyTo({ center: [lng, lat], zoom: 12 });
                addNearbyProviders(lng, lat);
              } else {
                alert('Location not found. Try a different search term.');
              }
            })
            .catch(err => {
              console.error('Search error:', err);
              searchBtn.disabled = false;
              searchBtn.textContent = 'Search Location';
              alert('Search failed. Please try again.');
            });
        } else {
          alert('Please enter a location to search.');
        }
      });

      // Also allow Enter key to trigger search
      locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          searchBtn.click();
        }
      });
    }

    if (geoBtn) {
      geoBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
          geoBtn.disabled = true;
          geoBtn.textContent = 'Locating...';
          
          navigator.geolocation.getCurrentPosition(pos => {
            const { longitude, latitude } = pos.coords;
            map.flyTo({ center: [longitude, latitude], zoom: 12 });
            addNearbyProviders(longitude, latitude);
            geoBtn.disabled = false;
            geoBtn.textContent = 'Use My Location';
          }, (err) => {
            console.error('Geolocation error:', err);
            geoBtn.disabled = false;
            geoBtn.textContent = 'Use My Location';
            alert("Location access denied. Type a city instead.");
          });
        } else {
          alert('Geolocation is not supported by this browser.');
        }
      });
    }
  });

  // Listen for geocoder results (from the built-in search box)
  geocoder.on('result', (e) => {
    const [lng, lat] = e.result.center;
    addNearbyProviders(lng, lat);
  });
}

function addNearbyProviders(lng, lat) {
  console.log('Adding providers near:', lng, lat);
  
  // Remove all existing markers
  markers.forEach(marker => marker.remove());
  markers = [];

  // Sample real-looking providers (you can expand this list!)
  const providers = [
    { name: "Calm Minds Therapy Center", type: "Therapist", phone: "+1 555-0101", coords: [lng + 0.01, lat + 0.01] },
    { name: "Hope Counseling Services", type: "Clinic", phone: "+1 555-0102", coords: [lng - 0.015, lat + 0.008] },
    { name: "Peace Within Psychology", type: "Individual Therapy", phone: "+1 555-0103", coords: [lng + 0.02, lat - 0.01] },
    { name: "Family Wellness Center", type: "Family Therapy", phone: "+1 555-0104", coords: [lng - 0.01, lat - 0.015] },
    { name: "Lagos Mental Health Hub", type: "Free Support", phone: "+234 800-0000", coords: [lng + 0.018, lat + 0.005] }
  ];

  providers.forEach(provider => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = '🧭';
    el.style.fontSize = '32px';
    el.style.cursor = 'pointer';

    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <h3 style="margin:0 0 0.5rem; color:#7ec8e3;">${provider.name}</h3>
        <p><strong>${provider.type}</strong></p>
        <p>📞 ${provider.phone}</p>
        <button onclick="saveLocation('${provider.name.replace(/'/g, "\\'")}', ${provider.coords[0]}, ${provider.coords[1]})" 
                style="margin-top:0.8rem; padding:0.5rem 1rem; background:#7ec8e3; color:white; border:none; border-radius:8px; cursor:pointer;">
          Save This Location
        </button>
      `);

    const marker = new mapboxgl.Marker(el)
      .setLngLat(provider.coords)
      .setPopup(popup)
      .addTo(map);
    
    markers.push(marker); // Store marker reference
  });
}

// Global function for popup button
window.saveLocation = (name, lng, lat) => {
  let saved = JSON.parse(localStorage.getItem('savedLocations') || '[]');
  if (!saved.some(l => l.name === name)) {
    saved.push({ name, lng, lat, savedAt: new Date().toLocaleDateString() });
    localStorage.setItem('savedLocations', JSON.stringify(saved));
    loadSavedLocations();
    alert('Location saved! You can find it below anytime.');
  } else {
    alert('Already saved!');
  }
};

function loadSavedLocations() {
  const saved = JSON.parse(localStorage.getItem('savedLocations') || '[]');
  const list = document.getElementById('saved-list');

  if (saved.length === 0) {
    list.innerHTML = '<p style="color:#888; text-align:center;">No saved locations yet.</p>';
    return;
  }

  list.innerHTML = saved.map(loc => `
    <div class="entry" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${loc.name}</strong><br>
        <small>Saved on ${loc.savedAt}</small>
      </div>
      <button onclick="map.flyTo({center: [${loc.lng}, ${loc.lat}], zoom: 15})" 
              style="padding:0.5rem 1rem; background:var(--mint-green); color:#222; border:none; border-radius:8px;">
        Go There
      </button>
    </div>
  `).join('');
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing map...');
  initMap();
});