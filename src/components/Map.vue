<script setup>
const props = defineProps({
    places: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(["addPlace", 'removePlace']);

const exist = (place) => {
    return props.places.some((p) => p.place_id === place.place_id);
};

function getCurrentCoordinates() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error(error);
                resolve({
                    lat: 40.73061,
                    lng: -73.935242,
                });
            }
        );
    });
}

async function initMap() {
    const coordinates = await getCurrentCoordinates();

    const map = new google.maps.Map(document.getElementById("map"), {
        center: coordinates,
        zoom: 13,
        mapTypeControl: false,
        type: ['restaurant']
    });

    const $searchBar = document.getElementById("search-bar");
    const input = document.getElementById("pac-input");

    const options = {
        fields: ["place_id", "formatted_address", "geometry", "name"],
        strictBounds: false,
        types: ["restaurant", "cafe", "bar", "food"],
    };

    map.controls[google.maps.ControlPosition.TOP_CENTER].push($searchBar);

    const autocomplete = new google.maps.places.Autocomplete(
        input,
        options
    );

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo("bounds", map);

    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");

    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
    });

    autocomplete.addListener("place_changed", () => {
        infowindow.close();
        marker.setVisible(false);


        const place = autocomplete.getPlace();

        let canAdd = !exist(place);

        if (canAdd) {
            infowindowContent.children["place-button"].textContent = "Add";
        } else {
            infowindowContent.children["place-button"].textContent = "Remove";
        }

        if (!place.geometry || !place.geometry.location) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert(
                "No details available for input: '" + place.name + "'"
            );
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        infowindowContent.children["place-name"].textContent = place.name;
        infowindowContent.children["place-address"].textContent =
            place.formatted_address;

        infowindowContent.children["place-button"].onclick = () => {
            canAdd = !exist(place);
            canAdd ? emit('addPlace', place) : emit('removePlace', place);
            if (canAdd) {
                infowindowContent.children["place-button"].textContent = "Remove";
            } else {
                infowindowContent.children["place-button"].textContent = "Add";
            }
        };

        infowindow.open(map, marker);
    });
}

window.initMap = initMap;
</script>

<template>
    <div class="map">
        <div id="search-bar">
            <input id="pac-input" placeholder="Enter a location" />
        </div>
        <div id="map"></div>
        <div id="infowindow-content">
            <span id="place-name" class="title"></span><br />
            <span id="place-address"></span>
            <button id="place-button" type="button"
                class="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-4 mt-2 hover:bg-black/80 w-full">Add</button>
        </div>
    </div>
</template>

<style scoped>
.map {
    max-width: 800px;
    height: 450px;
}

#map {
    height: 100%;
}

#description {
    font-family: Roboto;
    font-size: 15px;
    font-weight: 300;
}

#infowindow-content .title {
    font-weight: bold;
}

#infowindow-content {
    display: none;
}

#map #infowindow-content {
    display: inline;
}

#search-bar {
    width: 100%;
    margin-top: 1rem;
}

#pac-input {
    background-color: #fff;
    font-family: Roboto;
    font-size: 15px;
    font-weight: 300;
    margin-left: 12px;
    padding: 12px 8px;
    text-overflow: ellipsis;
    width: 85%;
    max-width: 400px;
    border: 2px solid;
}

#pac-input:focus {
    border-color: #4d90fe;
}

#pac-input::placeholder {
    color: #111;
}

#title {
    color: #fff;
    background-color: #4d90fe;
    font-size: 25px;
    font-weight: 500;
    padding: 6px 12px;
}
</style>