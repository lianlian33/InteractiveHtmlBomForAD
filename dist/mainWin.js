
function startWin() {
    mainWin.Show(); 
}

function mainWinShow(Sender) {
    var iniFileName = CURRENT_PATH + "config.ini";

    if (FileExists(iniFileName)) {
        var iniFile = TIniFile.Create(iniFileName);
        if (PCBServer != null) {
            PCBServer.PreProcess;
            var currentPcb = PCBServer.GetCurrentPCBBoard();

            if (currentPcb != null) {
                var currentPath = ExtractFilePath(currentPcb.FileName);
                var filename = currentPath + "PnPout\\" + ExtractFileName(currentPcb.FileName).split(".")[0] + ".html";
                TEditCurrentPcbPath.Text = filename;
                TEditExtraFileName.Text = currentPath;
            } else {
                TEditCurrentPcbPath.Text = iniFile.ReadString("General", "Directory", "");
                TEditExtraFileName.Text = iniFile.ReadString("ExtraFields", "ExtraFileName", "");
            }

            PCBServer.PostProcess;
        } else {
            TEditCurrentPcbPath.Text = iniFile.ReadString("General", "Directory", "");
            TEditExtraFileName.Text = iniFile.ReadString("ExtraFields", "ExtraFileName", "");
        }
        CbIncludeTracksAndSolidPolygons.Checked = iniFile.ReadBool("General", "IncludeTracksAndSolidPolygons", false);
        CbIncludeVias.Checked = iniFile.ReadBool("General", "IncludeVias", false);
        // CbIncludeHatched.Checked = iniFile.ReadBool("General", "IncludeHatched", false);
        // CbIncludeNets.Checked = iniFile.ReadBool("General", "IncludeNets", false);
        CbIncludeHatched.Checked = false;
        CbIncludeNets.Checked = false;

        CbBlacklistEmpty.Checked = iniFile.ReadBool("General", "BlacklistEmpty", true);
        CbBlacklist1Pad.Checked = iniFile.ReadBool("General", "Blacklist1Pad", true);
        CbBlacklistTh.Checked = iniFile.ReadBool("General", "BlacklistTh", true);
        if (iniFile.ReadBool("General", "PcbOutlineMech1", false)) {
            RBtnMech1.Checked = true;
            RBtnKeepOutLayer.Checked = false;
        } else {
            RBtnMech1.Checked = false;
            RBtnKeepOutLayer.Checked = true;
        }

        CbDarkMode.Checked = iniFile.ReadBool("HtmlDefaults", "DarkMode", false);
        CbShowFootprintPads.Checked = iniFile.ReadBool("HtmlDefaults", "ShowFootprintPads", true);
        CbShowFabricationLayer.Checked = iniFile.ReadBool("HtmlDefaults", "ShowFabricationLayer", false);
        CbShowSilkscreen.Checked = iniFile.ReadBool("HtmlDefaults", "ShowSilkscreen", true);
        CbHighlightFirstPin.Checked = iniFile.ReadBool("HtmlDefaults", "HighlightPin1", false);
        CbContinuousRedrawOnDrag.Checked = iniFile.ReadBool("HtmlDefaults", "ContinuousRedrawOnDrag", true);

        TTrackBarRotation.Position = (iniFile.ReadInteger("HtmlDefaults", "PcbRotation", 0) + 180)/5;
        TTextRotation.Caption = [TTrackBarRotation.Position * 5 - 180, String.fromCharCode(176)].join("");

        TEditHtmlCheckboxes.Text = iniFile.ReadString("HtmlDefaults", "HtmlCheckboxes", "Sourced,Placed");
        RBtnBomOnly.Checked = iniFile.ReadBool("HtmlDefaults", "BomViewOnly", false);
        RBtnBomLeftDrawingRight.Checked = iniFile.ReadBool("HtmlDefaults", "BomViewLeftDrawingRight", true);
        RBtnBomTopDrawingBottom.Checked = iniFile.ReadBool("HtmlDefaults", "BomViewTopDrawingBottom", false);
        RBtnFrontOnly.Checked = iniFile.ReadBool("HtmlDefaults", "PcbLayerFrontOnly", false);
        RBtnFrontAndBack.Checked = iniFile.ReadBool("HtmlDefaults", "PcbLayerFrontAndBack", true);
        RBtnBackOnly.Checked = iniFile.ReadBool("HtmlDefaults", "PcbLayerBackOnly", false);
        // CbOpenBrowser.Checked = iniFile.ReadBool("HtmlDefaults", "OtherOpenBrowser", false);
        CbOpenBrowser.Checked = false;
        CbOpenExplorer.Checked = iniFile.ReadBool("HtmlDefaults", "OtherOpenExplorer", true);

        iniFile.Free;
    } else {
        if (PCBServer != null) {
            PCBServer.PreProcess;
            var currentPcb = PCBServer.GetCurrentPCBBoard();

            if (currentPcb != null) {
                var currentPath = ExtractFilePath(currentPcb.FileName);
                var filename = currentPath + "PnPout\\" + ExtractFileName(currentPcb.FileName).split(".")[0] + ".html";
                TEditCurrentPcbPath.Text = filename;
                TEditExtraFileName.Text = currentPath;
            } else {
                TEditCurrentPcbPath.Text = "";
                TEditExtraFileName.Text = "";
            }

            PCBServer.PostProcess;
        } else {
            TEditCurrentPcbPath.Text = "";
            TEditExtraFileName.Text = "";
        }

        CbBlacklistEmpty.Checked = true;
        CbBlacklist1Pad.Checked = true;
        CbBlacklistTh.Checked = true;

        CbIncludeTracksAndSolidPolygons.Checked = false;
        CbIncludeVias.Checked = false;
        CbIncludeHatched.Checked = false;
        CbIncludeNets.Checked = false;

        CbBlacklistEmpty.Checked = true;
        CbBlacklist1Pad.Checked = true;
        RBtnKeepOutLayer.Checked = true;
        RBtnMech1.Checked = false;

        CbDarkMode.Checked = false;
        CbShowFootprintPads.Checked = true;
        CbShowFabricationLayer.Checked = false;
        CbShowSilkscreen.Checked = true;
        CbHighlightFirstPin.Checked = false;
        CbContinuousRedrawOnDrag.Checked = true;

        TTrackBarRotation.Position = 36;
        TTextRotation.Caption = [0, String.fromCharCode(176)].join("");

        TEditHtmlCheckboxes.Text = "Sourced,Placed";
        RBtnBomOnly.Checked = false;
        RBtnBomLeftDrawingRight.Checked = true;
        RBtnBomTopDrawingBottom.Checked = false;
        RBtnFrontOnly.Checked = false;
        RBtnFrontAndBack.Checked = true;
        RBtnBackOnly.Checked = false;
        CbOpenBrowser.Checked = false;
        CbOpenExplorer.Checked = true;
    }
}

function GenerateBomClick(Sender) {
    var iniFileName = CURRENT_PATH + "config.ini";
    setValueToInifile(iniFileName);

    // var config = getConfig();
    var config = {};
    config.include = {};
    config.htmlConfig = {};
    config.bomFilter = {};
    config.bomFilter["skipempty"] = CbBlacklistEmpty.Checked;
    config.bomFilter["skiponepad"] = CbBlacklist1Pad.Checked;
    config.bomFilter["skipth"] = CbBlacklistTh.Checked;

    config.htmlConfig["extra_fields"] = []; 
    config.htmlConfig["redraw_on_drag"] = CbContinuousRedrawOnDrag.Checked;

    if (RBtnMech1.Checked) {
        config.PcbOutlineMech1 = true;
    } else {
        config.PcbOutlineMech1 = false;
    }
    
    if (RBtnBomOnly.Checked) {
        config.htmlConfig["bom_view"] = "bom-only";
    } else if (RBtnBomLeftDrawingRight.Checked) {
        config.htmlConfig["bom_view"] = "left-right";
    } else if (RBtnBomTopDrawingBottom.Checked) {
        config.htmlConfig["bom_view"] = "top-bottom";
    }

    if (RBtnFrontOnly.Checked) {
        config.htmlConfig["layer_view"] = "F";
    } else if (RBtnFrontAndBack.Checked) {
        config.htmlConfig["layer_view"] = "FB";
    } else if (RBtnBackOnly.Checked) {
        config.htmlConfig["layer_view"] = "B";
    }
    
    config.htmlConfig["show_silkscreen"] = CbShowSilkscreen.Checked;
    config.htmlConfig["checkboxes"] = TEditHtmlCheckboxes.Text;
    config.htmlConfig["dark_mode"] = CbDarkMode.Checked;
    config.htmlConfig["highlight_pin1"] = CbHighlightFirstPin.Checked;
    config.htmlConfig["show_pads"] = CbShowFootprintPads.Checked;
    config.htmlConfig["show_fabrication"] = CbShowFabricationLayer.Checked;
    // config.htmlConfig["extra_fields"] = [];
    config.htmlConfig["board_rotation"] = TTrackBarRotation.Position * 5 - 180;

    config.include["tracks"] = CbIncludeTracksAndSolidPolygons.Checked;
    config.include["polys"] = CbIncludeTracksAndSolidPolygons.Checked;
    config.include["polyHatched"] = CbIncludeHatched.Checked;
    config.include["vias"] = CbIncludeVias.Checked;
    config.include["nets"] = CbIncludeNets.Checked;

    var filename = getSaveDir(TEditCurrentPcbPath.Text);
    if (filename == "") {
        return;
    }

    var pcb = parsePcb(config);
    if (!pcb) {
        return;
    };

    var extra_data;

    pcb.pcbdata["bom"] = pickBom(pcb, config, extra_data);
    pcb.pcbdata["ibom_version"] = "v2.3";

    var s = JSON.stringify(pcb.pcbdata);
    var b = LZStr.compressToBase64(s);

    b = 'var pcbdata = JSON.parse(LZString.decompressFromBase64("' + b + '"))';

    var config_js = "var config = " + JSON.stringify(config.htmlConfig);
    var html = generateFile(b, config_js);
    save2file(html, filename, false);

    try {
        var commandline = "explorer.exe " + ExtractFilePath(filename);
        var errcode = RunApplication(commandline);
    }
    catch(e) {
        showmessage(e.message);
    };
}

function pickBom(pcb, config, extra_data) {
    // type (list, dict, dict) -> dict
    // return: dict of BOM tables (qty, value, footprint, refs) and dnp components
    var extra_data = arguments[2] ? arguments[2] : {}; 

    var res = {};
    var extras = [];
    var modules = pcb.modules;
    var rows = {};  // { itemkey: [quantity, comment, footprint, designator, extras] }
    var rowsB = {};
    var rowsF = {};
    var skippedComponents = [];
    var count = modules.length;
    for (var i = 0; i < count; i++) {
        if (skipComponent(modules[i], config)) {
            skippedComponents.push(i);
            continue;
        }
    
        //   extra_data =
        //    {
        //       ref1: {
        //         field_name1: field_value1,
        //         field_name2: field_value2,
        //         ...
        //         },
        //       ref2: ...
        //    }
        if (!Object.prototype.hasOwnProperty.call(rows, modules[i].itemkey)) {

            if (Object.prototype.hasOwnProperty.call(extra_data, modules[i]["component"].ref)) {
                for (var field_name in extra_data[modules[i]["component"].ref]) {
                    extras.push(extra_data[modules[i]["component"].ref][field_name]);  // extras = [field_value1, field_value2 ...]    
                }   
            } else {
                for (var k = config["htmlConfig"].extra_fields.length - 1; k >= 0; k--) {
                    extras.push("");
                }
            }     

            rows[modules[i].itemkey] = [1, modules[i]["component"].val, modules[i]["component"].footprint, [[modules[i]["component"].ref, i]], extras];
            extras = [];
        } else {
            rows[modules[i].itemkey][0]++;
            rows[modules[i].itemkey][3].push([modules[i]["component"].ref, i]);
        }

        if (modules[i]["component"].layer == "F") {
            if (!Object.prototype.hasOwnProperty.call(rowsF, modules[i].itemkey)) {
                rowsF[modules[i].itemkey] = [1, modules[i]["component"].val, modules[i]["component"].footprint, [[modules[i]["component"].ref, i]] ];
            } else {
                rowsF[modules[i].itemkey][0]++;
                rowsF[modules[i].itemkey][3].push([modules[i]["component"].ref, i]);    
            }
        } else {
            if (!Object.prototype.hasOwnProperty.call(rowsB, modules[i].itemkey)) {
                rowsB[modules[i].itemkey] = [1, modules[i]["component"].val, modules[i]["component"].footprint, [[modules[i]["component"].ref, i]] ];
            } else {
                rowsB[modules[i].itemkey][0]++;
                rowsB[modules[i].itemkey][3].push([modules[i]["component"].ref, i]);    
            }
        }
    }

    res.both = []
    for (var i in rows) {
        res.both.push(rows[i]);
    }

    res.F = []
    for (var i in rowsF) {
        rowsF[i].push(rows[i][4]); // add extras
        res.F.push(rowsF[i]);
    }

    res.B = []
    for (var i in rowsB) {
        rowsB[i].push(rows[i][4]); 
        res.B.push(rowsB[i]);
    }
    
    res.skipped = skippedComponents;
    return res;
}


function BtnOpenClick(Sender) {
    OpenDialog1.InitialDir = ExtractFilePath(TEditExtraFileName.Text);
    if (OpenDialog1.Execute) {
        TEditExtraFileName.Text = OpenDialog1.FileName;
    }
}

function BtnSaveClick(Sender) {
    SaveDialog1.InitialDir = ExtractFilePath(TEditCurrentPcbPath.Text);
    if (SaveDialog1.Execute) {
        TEditCurrentPcbPath.Text = SaveDialog1.Filename;
    }
}

function TTrackBarRotationChange(Sender) {
    TTextRotation.Caption = [TTrackBarRotation.Position * 5 - 180, String.fromCharCode(176)].join("");
}


function setValueToInifile(iniFileName) {
    var iniFile = TIniFile.Create(iniFileName);
    iniFile.WriteString("General", "Directory", TEditCurrentPcbPath.Text);
    iniFile.WriteBool("General", "IncludeTracksAndSolidPolygons", CbIncludeTracksAndSolidPolygons.Checked);
    iniFile.WriteBool("General", "IncludeVias", CbIncludeVias.Checked);
    iniFile.WriteBool("General", "IncludeHatched", CbIncludeHatched.Checked);
    iniFile.WriteBool("General", "IncludeNets", CbIncludeNets.Checked);
    iniFile.WriteBool("General", "BlacklistEmpty", CbBlacklistEmpty.Checked);
    iniFile.WriteBool("General", "Blacklist1Pad", CbBlacklist1Pad.Checked);
    iniFile.WriteBool("General", "BlacklistTh", CbBlacklistTh.Checked);
    iniFile.WriteBool("General", "PcbOutlineMech1", RBtnMech1.Checked);

    iniFile.WriteBool("HtmlDefaults", "DarkMode", CbDarkMode.Checked);
    iniFile.WriteBool("HtmlDefaults", "ShowFootprintPads", CbShowFootprintPads.Checked);
    iniFile.WriteBool("HtmlDefaults", "ShowFabricationLayer", CbShowFabricationLayer.Checked);
    iniFile.WriteBool("HtmlDefaults", "ShowSilkscreen", CbShowSilkscreen.Checked);
    iniFile.WriteBool("HtmlDefaults", "HighlightPin1", CbHighlightFirstPin.Checked);
    iniFile.WriteBool("HtmlDefaults", "ContinuousRedrawOnDrag", CbContinuousRedrawOnDrag.Checked);
    iniFile.WriteInteger("HtmlDefaults", "PcbRotation", (TTrackBarRotation.Position * 5 - 180));
    iniFile.WriteString("HtmlDefaults", "HtmlCheckboxes", TEditHtmlCheckboxes.Text);
    iniFile.WriteBool("HtmlDefaults", "BomViewOnly", RBtnBomOnly.Checked);
    iniFile.WriteBool("HtmlDefaults", "BomViewLeftDrawingRight", RBtnBomLeftDrawingRight.Checked);
    iniFile.WriteBool("HtmlDefaults", "BomViewTopDrawingBottom", RBtnBomTopDrawingBottom.Checked);
    iniFile.WriteBool("HtmlDefaults", "PcbLayerFrontOnly", RBtnFrontOnly.Checked);
    iniFile.WriteBool("HtmlDefaults", "PcbLayerFrontAndBack", RBtnFrontAndBack.Checked);
    iniFile.WriteBool("HtmlDefaults", "PcbLayerBackOnly", RBtnBackOnly.Checked);
    iniFile.WriteBool("HtmlDefaults", "OtherOpenBrowser", CbOpenBrowser.Checked);
    iniFile.WriteBool("HtmlDefaults", "OtherOpenExplorer", CbOpenExplorer.Checked);

    iniFile.WriteString("ExtraFields", "ExtraFileName", TEditExtraFileName.Text);
    iniFile.Free;
}

function getSaveDir(text) {
    var fso = new ActiveXObject("Scripting.FileSystemObject"); 
    var filename = text.replace("/", "\\");
    var arr = filename.split("\\");
    var len = arr.length - 1;

    if (!fso.FolderExists(arr[0])) {
        showmessage("Directory error");
        return "";
    }

    for (var i = 0; i <= len; i++) {
        if (arr[i] == "") {
            showmessage("Directory error");
            return "";
        }
    }

    return filename;
}

