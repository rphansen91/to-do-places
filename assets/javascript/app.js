
$(document).ready(function(){


//====================FIREBASE DATABASE====================


var config = {
	   apiKey: "AIzaSyDaDxv9jNfNhEd7stk340f8FJqDo7iOtSg",
	   authDomain: "to-do-places.firebaseapp.com",
	   databaseURL: "https://to-do-places.firebaseio.com",
	   projectId: "to-do-places",
	   storageBucket: "to-do-places.appspot.com",
	   messagingSenderId: "329838193586"
	 };
	 firebase.initializeApp(config);
var database = firebase.database();
database.ref().on("child_added", function(snapshot) {
	var a = snapshot.val();
	 $(".listItem").prepend("-" + a.placeName + "<br>");
	 places.push(a.placeID);
});


//====================GLOBAL VARIABLES====================


var map;
var center = new google.maps.LatLng(39.7392, -104.990);
var infoWindow;
var radius = 8050;


var waypts = [];
var places = [];
var markers = [];
var typeSelection = 'cafe';
var selectedKeyword;


//====================DEFAULT MAP====================


var defaultMap = {
	initialize: function() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: center,
			zoom: 3
		});
	}
}


//====================NEW MAP====================


var newMap = {
	initialize: function() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: center,
			zoom: 11
		});
        var request = {
        	location: center,
        	radius: radius,
        	types: [typeSelection],
        	keyword: [selectedKeyword]
        };
        infoWindow = new google.maps.InfoWindow();
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, newMap.callback);
		google.maps.event.addListener(map, 'rightclick', function(event) {
			waypoints.clearMarkers(markers)
			var request = {
				location: event.latLng,
				radius: radius,
				types: [typeSelection],
				keyword: [selectedKeyword]
			};
			center = event.latLng;
			newMap.initialize();
			service.nearbySearch(request, newMap.callback);
		})
		newMap.mapCircle();
	},
	callback: function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				markers.push(waypoints.createMarker(results[i]));
			}
		}
	},
	setType: function () {
		typeSelection = $(this).attr("val");
		selectedKeyword = null;
		newMap.initialize();
	},
	mapCircle: function() {
		var circle = new google.maps.Circle({
			center: center,
			map: map,
			radius: radius,
			fillOpacity: 0,
			strokeColor: "red",
			strokeWeight: 1
		});
	}
}




//====================WAYPOINTS / MARKERS====================


var waypoints = {
	createMarker: function (place) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location
		});
		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent(place.name + "<br>" + "<button class='add'>Add to List</button>" );
			infoWindow.open(map, this);
			$(".add").on("click", function() {
				database.ref().push({
					placeID: place.place_id,
					placeName: place.name
				});
				markers.splice();
				waypoints.clearMarkers(markers);
			});
		});
		return marker;
	},
	clearMarkers: function (markers) {
		for (var m in markers) {
			markers[m].setMap(null)
		}
		markers = []
	}
}


//====================BUTTONS====================


var buttons = {	
	mapIt: function() {
		for (var i = 0; i < places.length; i++) {
			waypts[i] = {	
				stopover: true,
				location: {'placeId': places[i]}	
			};
		}
		var map = new google.maps.Map(document.getElementById("map"));
		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer({
			map: map
		});
		directionsService.route({
			origin: {
				'placeId': 'ChIJ43izIC2Fa4cR-MengeK0-DI'
			},
			destination: {
				'placeId': 'ChIJ43izIC2Fa4cR-MengeK0-DI'
			},
			waypoints: waypts,
			optimizeWaypoints: true,
			travelMode: google.maps.TravelMode.DRIVING
		}, 
		function(response, status) {
			if (status === 'OK') {
				directionsDisplay.setDirections(response);
			} else {
				window.alert('Directions request failed due to ' + status);
			}
		});
	},
	submitPlace: function () {
		selectedKeyword = $("#placeInput").val();
		typeSelection = null;
		newMap.initialize();
	},
	removeDatabasePlaces: function () {
		database.ref().remove();
		$('.listItem').empty();
		places = [];
		waypts = [];
		defaultMap.initialize();
	}
}




//====================CLICK EVENTS====================
$('#myForm input').on('change', function() {
   var radiusValue = ($('input[name=radius]:checked', '#myForm').val());
   radius = Number(radiusValue);
   newMap.initialize();
});

$(".nav-item").on("click", newMap.setType);

$("#mapIt").on("click", buttons.mapIt);

$("#submit").on("click", buttons.submitPlace);

$("#clear").on("click", buttons.removeDatabasePlaces);



google.maps.event.addDomListener(window, 'load', defaultMap.initialize);
});
