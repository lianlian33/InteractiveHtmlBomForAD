
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

	return config;
} 
