const CACHE_NAME = 'v1';
const urlsToCache = [
    // HTML
    'index.html',
    'favorites.html',
    'manifest.json',
    // CSS
    'assets/scripts/favorites.css',
    'assets/scripts/media.css',
    'assets/scripts/modal.css',
    'assets/scripts/top10.css',
    'assets/scripts/univ.css',
    // Font Awesome
    'fontawesome/css/all.css',
    'fontawesome/webfonts/fa-brands-400.ttf',
    'fontawesome/webfonts/fa-brands-400.woff2',
    'fontawesome/webfonts/fa-regular-400.ttf',
    'fontawesome/webfonts/fa-regular-400.woff2',
    'fontawesome/webfonts/fa-solid-900.ttf',
    'fontawesome/webfonts/fa-solid-900.woff2',
    'fontawesome/webfonts/fa-v4compatibility.ttf',
    'fontawesome/webfonts/fa-v4compatibility.woff2',
    'fontawesome/svgs/solid/house.svg',
    'fontawesome/svgs/solid/person-hiking.svg',
    'fontawesome/svgs/solid/star.svg',
    'fontawesome/svgs/solid/utensils.svg',
    // JS
    'assets/scripts/scripts.js',
    // Favicons Icons
    'favicon-B/favicon-16x16.png',
    'favicon-B/favicon-32x32.png',
    'favicon-B/apple-touch-icon.png',
    // Place Images
    'assets/images/TSNMOP/Lobby.jpg',
    'assets/images/TSNMOP/ToyStory.jpg', 
    'assets/images/TSNMOP/View1.jpg', 
    'assets/images/TSNMOP/Batman.jpg', 
    'assets/images/TSNMOP/SpiderMan.jpg',
    'assets/images/TSNMOP/Goldilocks.jpg',
    'assets/images/TSNMOP/Wegmans.jpg',
    'assets/images/GEM/Museum.jpg', 
    'assets/images/GEM/Building.jpeg', 
    'assets/images/GEM/Room1.jpg',
    'assets/images/GEM/Library.jpg',
    'assets/images/GEM/Office.jpg',
    'assets/images/GEM/Piano.jpg',
    'assets/images/GEM/DR.jpg', 
    'assets/images/GEM/Back.jpg', 
    'assets/images/GEM/Back2.jpg',
    'assets/images/LFP/Falls.jpg',
    'assets/images/LFP/Water-Turbine-Building.jpg', 
    'assets/images/LFP/Frozen-Falls.png', 
    'assets/images/LFP/Cave.jpg', 
    'assets/images/LFP/Rocks.jpg',
    'assets/images/LFP/Falls2.jpg', 
    'assets/images/LFP/Falls3.jpg',
    'assets/images/HF/Falls.jpg',
    'assets/images/HF/Falls2.jpg',
    'assets/images/HF/Bridge.jpg',
    'assets/images/HF/Falls3.jpg',
    'assets/images/HF/Falls4.jpg',
    'assets/images/HF/Falls5.jpg',
    'assets/images/OBP/Entrance-View.jpg', 
    'assets/images/OBP/OBP-View2.jpg', 
    'assets/images/OBP/Castle-View.jpg', 
    'assets/images/OBP/OBP-View.jpg', 
    'assets/images/OBP/Port-View.jpg',
    'assets/images/CHP/Park.jpg',
    'assets/images/CHP/Park1.jpg',
    'assets/images/CHP/Park2.jpg',
    'assets/images/CHP/City-View.png',
    'assets/images/CHP/Pillar.jpg',
    'assets/images/CHP/Silos.jpg',
    'assets/images/CHP/Reservoir2.jpg',
    'assets/images/CHP/Silo-Inside.jpg',
    'assets/images/CHP/Reservoir.jpg',
    'assets/images/SPZ/Animal.jpg', 
    'assets/images/SPZ/Statue.jpg',
    'assets/images/SPZ/Animal8.jpg', 
    'assets/images/SPZ/Animal7.jpg', 
    'assets/images/SPZ/Animal9.jpg',
    'assets/images/SPZ/Animal6.jpeg',
    'assets/images/SPZ/Animal5.jpg',
    'assets/images/SPZ/Animal4.jpg',
    'assets/images/SPZ/Animal3.jpg',
    'assets/images/SPZ/Animal2.jpg',
    'assets/images/HP/Entrance-View.jpg', 
    'assets/images/HP/Castle-View1.jpg', 
    'assets/images/HP/Castle-View2.jpg', 
    'assets/images/HP/Lilac-View.jpg', 
    'assets/images/HP/Pond-View.jpg',
    'assets/images/HP/Skyline-View.jpg',
    'assets/images/RPM/Market-Arches.jpg', 
    'assets/images/RPM/Outside-View.jpg', 
    'assets/images/RPM/Vendors-View.jpg',
    'assets/images/TPP/TTP-View2.jpg', 
    'assets/images/TPP/TTP-View.jpg',
    'assets/images/TPP/Bridge.jpg',
    'assets/images/TPP/Wooded-Trails.jpg',
    'assets/images/TPP/Port.jpg',
    'assets/images/TPP/Active-Ship.jpg', 
    'assets/images/TPP/Ship.jpg',
    'assets/images/TPP/Beached-Cargo-Ship.jpg',
    'assets/images/Roux/Window.jpg', 
    'assets/images/Roux/Front.jpg', 
    'assets/images/Roux/Seating.jpg', 
    'assets/images/Roux/Breakfast.jpg', 
    'assets/images/Roux/Food.jpg',
    'assets/images/Polizzi/Window.jpg', 
    'assets/images/Polizzi/Seating.jpg', 
    'assets/images/Polizzi/Seating2.jpg', 
    'assets/images/Polizzi/Food.jpeg', 
    'assets/images/Polizzi/Food2.jpg',
    'assets/images/Polizzi/BrickStove.jpg',
    'assets/images/GH/Front 2.jpg', 
    'assets/images/GH/Front.jpg', 
    'assets/images/GH/Bar.jpg', 
    'assets/images/GH/Seating.jpg', 
    'assets/images/GH/Food-View.jpg',
    'assets/images/TRATA/Building-View.png', 
    'assets/images/TRATA/Inside-View.jpg', 
    'assets/images/TRATA/Inside-View-Above.jpg', 
    'assets/images/TRATA/Breakfast-View.jpg', 
    'assets/images/TRATA/Burger-View.jpg',
    'assets/images/Cotoletta/Building-View.jpg', 
    'assets/images/Cotoletta/Bar-View.jpg', 
    'assets/images/Cotoletta/Pizza-View.jpg', 
    'assets/images/Cotoletta/Sandwich-View.jpg', 
    'assets/images/Cotoletta/Sandwich_View-2.jpg',
    'assets/images/Redd/Seating.jpg', 
    'assets/images/Redd/Seating2.jpg', 
    'assets/images/Redd/Food.jpg', 
    'assets/images/Redd/Food2.jpg', 
    'assets/images/Redd/Food3.jpeg',
    'assets/images/TS/Lobby.jpg', 
    'assets/images/TS/Seating2.jpg', 
    'assets/images/TS/Seating.jpg', 
    'assets/images/TS/Food.jpg', 
    'assets/images/TS/Steak.jpg',
    'assets/images/GBH/Building-View.jpg', 
    'assets/images/GBH/Inside-View.jpg', 
    'assets/images/GBH/Outside-View.jpg', 
    'assets/images/GBH/Beer-View.jpg', 
    'assets/images/GBH/Food-View.jpg',
    'assets/images/DB/Building-View.jpg', 
    'assets/images/DB/Inside-View.jpg', 
    'assets/images/DB/Outside-View.jpg', 
    'assets/images/DB/Plate-View.jpg', 
    'assets/images/DB/Ribs-View.jpg',
    'assets/images/NTH/Logo.jpg',
    'assets/images/NTH/Counter.jpg', 
    'assets/images/NTH/Seating.jpg',
    'assets/images/NTH/Plate1.jpg', 
    'assets/images/NTH/Plate2.jpg',
    // Data
    'assets/data/data.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
});

self.addEventListener('activate', event => {
    var cacheWhitelist = ['v1']; // Add any other cache names you want to keep
  
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});