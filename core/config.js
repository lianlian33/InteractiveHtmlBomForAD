
function getConfig(non) {
	var config = {};

	config["htmlConfig"] = {
		"redraw_on_drag": true,
		"bom_view": "left-right", 
		"layer_view": "FB",
		"show_silkscreen": true,
		"checkboxes": "Sourced,Placed", 
		"dark_mode": false,
		"highlight_pin1": false, 
		"show_pads": true,
		"show_fabrication": false, 
		"extra_fields": [], 
		// "extra_fields": ["PartNum"],   //add ibom html column
		"board_rotation": 0
	};

	config["include"] = {
		"tracks": false, // not support arc for now, so parse one arc to a few tracks. slow.
		"vias": false,  // so many objects in pcbdata slow down the speed of generating bom.
		"nets": false,
		"polys": false, 
		"polyHatched": false  // a group of tracks and arcs( arc to tracks), very slow.
	};

	return config;
} 

var config = getConfig();
