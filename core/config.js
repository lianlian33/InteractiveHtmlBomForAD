
function getConfig(non) {
	var iniFileName = CURRENT_PATH + "config.ini";
	var config = {};
	if (FileExists(iniFileName)) {
		var iniFile = TIniFile.Create(iniFileName);
		config.PcbOutlineMech1 = iniFile.ReadBool("General", "PcbOutlineMech1", false);
		config["htmlConfig"] = {
			"redraw_on_drag": iniFile.ReadBool("HtmlDefaults", "ContinuousRedrawOnDrag", true),
			"bom_view": "left-right", 
			"layer_view": "FB",
			"show_silkscreen": iniFile.ReadBool("HtmlDefaults", "ShowSilkscreen", true),
			"checkboxes": iniFile.ReadString("HtmlDefaults", "HtmlCheckboxes", "Sourced,Placed"),
			"dark_mode": iniFile.ReadBool("HtmlDefaults", "DarkMode", false),
			"highlight_pin1": iniFile.ReadBool("HtmlDefaults", "HighlightPin1", false),
			"show_pads": iniFile.ReadBool("HtmlDefaults", "ShowFootprintPads", true),
			"show_fabrication": iniFile.ReadBool("HtmlDefaults", "ShowFabricationLayer", false),
			"extra_fields": [], 
			"board_rotation": iniFile.ReadInteger("HtmlDefaults", "PcbRotation", 36)
		};
		config["include"] = {
			"vias": iniFile.ReadBool("General", "IncludeVias", false),
			"nets": iniFile.ReadBool("General", "IncludeNets", false),
			"polyHatched": false  // a group of tracks and arcs( arc to tracks), very slow.
		};
		if (iniFile.ReadBool("General", "IncludeTracksAndSolidPolygons", false)) {
			config["include"]["tracks"] = true;
			config["include"]["polys"] = true;
		} else {
			config["include"]["tracks"] = false;
			config["include"]["polys"] = false;
		}

		config["bomFilter"] = {
			"skipempty": iniFile.ReadBool("General", "BlacklistEmpty", true),
			"skiponepad": iniFile.ReadBool("General", "Blacklist1Pad", true),
			"skipth": iniFile.ReadBool("General", "BlacklistTh", false)
		}

		iniFile.Free;
	} else {
		config.PcbOutlineMech1 = false;
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

		config["bomFilter"] = {
			"skipempty": true,
			"skiponepad": true,
			"skipth": false
		}
	}
	return config;
} 

