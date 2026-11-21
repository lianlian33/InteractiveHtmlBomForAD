
function getConfig(non) {
	var iniFileName = CURRENT_PATH + "config.ini";
	var iniFile = null;
	if (FileExists(iniFileName)) {
		iniFile = TIniFile.Create(iniFileName);
	}

	// when config.ini is missing, use the initial state of the settings dialog (mainWinShow)
	var config = {};
	config.PcbOutlineMech1 = iniFile ? iniFile.ReadBool("General", "PcbOutlineMech1", false) : false;

	var bomViewOnly = iniFile ? iniFile.ReadBool("HtmlDefaults", "BomViewOnly", false) : false;
	var bomViewLeftRight = iniFile ? iniFile.ReadBool("HtmlDefaults", "BomViewLeftDrawingRight", true) : true;
	var bomViewTopBottom = iniFile ? iniFile.ReadBool("HtmlDefaults", "BomViewTopDrawingBottom", false) : false;
	var layerFrontOnly = iniFile ? iniFile.ReadBool("HtmlDefaults", "PcbLayerFrontOnly", false) : false;
	var layerFrontBack = iniFile ? iniFile.ReadBool("HtmlDefaults", "PcbLayerFrontAndBack", true) : true;
	var layerBackOnly = iniFile ? iniFile.ReadBool("HtmlDefaults", "PcbLayerBackOnly", false) : false;

	var bomView = "left-right";
	if (bomViewOnly) {
		bomView = "bom-only";
	} else if (bomViewLeftRight) {
		bomView = "left-right";
	} else if (bomViewTopBottom) {
		bomView = "top-bottom";
	}

	var layerView = "FB";
	if (layerFrontOnly) {
		layerView = "F";
	} else if (layerFrontBack) {
		layerView = "FB";
	} else if (layerBackOnly) {
		layerView = "B";
	}

	config["htmlConfig"] = {
		"redraw_on_drag": iniFile ? iniFile.ReadBool("HtmlDefaults", "ContinuousRedrawOnDrag", true) : true,
		"bom_view": bomView,
		"layer_view": layerView,
		"show_silkscreen": iniFile ? iniFile.ReadBool("HtmlDefaults", "ShowSilkscreen", true) : true,
		"checkboxes": iniFile ? iniFile.ReadString("HtmlDefaults", "HtmlCheckboxes", "Sourced,Placed") : "Sourced,Placed",
		"dark_mode": iniFile ? iniFile.ReadBool("HtmlDefaults", "DarkMode", false) : false,
		"highlight_pin1": iniFile ? iniFile.ReadBool("HtmlDefaults", "HighlightPin1", false) : false,
		"show_pads": iniFile ? iniFile.ReadBool("HtmlDefaults", "ShowFootprintPads", true) : true,
		"show_fabrication": iniFile ? iniFile.ReadBool("HtmlDefaults", "ShowFabricationLayer", false) : false,
		"extra_fields": [],
		"board_rotation": iniFile ? iniFile.ReadInteger("HtmlDefaults", "PcbRotation", 0) : 0
	};

	var includeTracks = iniFile ? iniFile.ReadBool("General", "IncludeTracksAndSolidPolygons", false) : false;
	config["include"] = {
		"tracks": includeTracks,
		"polys": includeTracks,
		"vias": iniFile ? iniFile.ReadBool("General", "IncludeVias", false) : false,
		"nets": iniFile ? iniFile.ReadBool("General", "IncludeNets", false) : false,
		"polyHatched": iniFile ? iniFile.ReadBool("General", "IncludeHatched", false) : false
	};

	config["bomFilter"] = {
		"skipempty": iniFile ? iniFile.ReadBool("General", "BlacklistEmpty", true) : true,
		"skiponepad": iniFile ? iniFile.ReadBool("General", "Blacklist1Pad", true) : true,
		"skipth": iniFile ? iniFile.ReadBool("General", "BlacklistTh", false) : false
	};

	if (iniFile) {
		iniFile.Free;
	}

	return config;
}
