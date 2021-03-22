
function startWin() {
    mainWin.Show(); 
}

function mainWinShow(Sender) {
    var iniFileName = CURRENT_PATH + "config.ini";

    if (PCBServer != null) {
        PCBServer.PreProcess;
        var currentPcb = PCBServer.GetCurrentPCBBoard();

        if (currentPcb != null) {
            var currentPath = ExtractFilePath(currentPcb.FileName);
            var filename = currentPath + "PnPout\\" + ExtractFileName(currentPcb.FileName).split(".")[0] + ".html";
            TEditCurrentPcbPath.Text = filename;
            TEditExtraFileName.Text = currentPath;
        } else {
            TEditCurrentPcbPath.Text = getValueFromInifile(iniFileName, "General", "Directory", "");
            TEditExtraFileName.Text = getValueFromInifile(iniFileName, "ExtraFields", "ExtraFileName", "");
        }

        PCBServer.PostProcess;
    } else {
        TEditCurrentPcbPath.Text = getValueFromInifile(iniFileName, "General", "Directory", "");
        TEditExtraFileName.Text = getValueFromInifile(iniFileName, "ExtraFields", "ExtraFileName", "");
    }

    CbIncludeTracksAndSolidPolygons.Checked = getValueFromInifile(iniFileName, "General", "IncludeTracksAndSolidPolygons", false);
    CbIncludeVias.Checked = getValueFromInifile(iniFileName, "General", "IncludeVias", false);
    CbIncludeHatched.Checked = getValueFromInifile(iniFileName, "General", "IncludeHatched", false);
    CbIncludeNets.Checked = getValueFromInifile(iniFileName, "General", "IncludeNets", false);

    CbBlacklistDNP.Checked = getValueFromInifile(iniFileName, "General", "BlacklistDNP", true);
    CbBlacklist1Pad.Checked = getValueFromInifile(iniFileName, "General", "Blacklist1Pad", true);

    CbDarkMode.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "DarkMode", false);
    CbShowFootprintPads.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "ShowFootprintPads", true);
    CbShowFabricationLayer.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "ShowFabricationLayer", false);
    CbShowSilkscreen.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "ShowSilkscreen", true);
    CbHighlightFirstPin.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "HighlightFirstPin", false);
    CbContinuousRedrawOnDrag.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "ContinuousRedrawOnDrag", true);

    TTrackBarRotation.Position = getValueFromInifile(iniFileName,"HtmlDefaults", "PcbRotation", 36);
    TTextRotation.Caption = [TTrackBarRotation.Position * 5 - 180, String.fromCharCode(176)].join("");

    TEditHtmlCheckboxes.Text = getValueFromInifile(iniFileName, "HtmlDefaults", "HtmlCheckboxes", "Sourced,Placed");
    RBtnBomOnly.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "BomViewOnly", false);
    RBtnBomLeftDrawingRight.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "BomViewLeftDrawingRight", true);
    RBtnBomTopDrawingBottom.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "BomViewTopDrawingBottom", false);
    RBtnFrontOnly.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "PcbLayerFrontOnly", false);
    RBtnFrontAndBack.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "PcbLayerFrontAndBack", true);
    RBtnBackOnly.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "PcbLayerBackOnly", false);
    CbOpenBrowser.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "OtherOpenBrowser", false);
    CbOpenExplorer.Checked = getValueFromInifile(iniFileName, "HtmlDefaults", "OtherOpenExplorer", true);
}

function GenerateBomClick(Sender) {
    var iniFileName = CURRENT_PATH + "config.ini";
    setValueToInifile(iniFileName);

    config.htmlConfig["redraw_on_drag"] = CbContinuousRedrawOnDrag.Checked;
    
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

    var pcb = parsePcb();
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
        if (skipComponent(modules[i])) {
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
        if (!rows.hasOwnProperty(modules[i].itemkey)) {

            if (extra_data.hasOwnProperty(modules[i]["component"].ref)) {
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
            if (!rowsF.hasOwnProperty(modules[i].itemkey)) {
                rowsF[modules[i].itemkey] = [1, modules[i]["component"].val, modules[i]["component"].footprint, [[modules[i]["component"].ref, i]] ];
            } else {
                rowsF[modules[i].itemkey][0]++;
                rowsF[modules[i].itemkey][3].push([modules[i]["component"].ref, i]);    
            }
        } else {
            if (!rowsB.hasOwnProperty(modules[i].itemkey)) {
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

function getValueFromInifile(iniFileName, section, key, defaultValue) {
    var IniFile, res;
    var res = defaultValue;
    if (FileExists(iniFileName)) {
        try {
            IniFile = TIniFile.Create(iniFileName);
            res = IniFile.ReadString(section, key, defaultValue);   
        }
        catch (err) {
            ShowMessage("read .ini error");
        }
        finally {
            return res;
            Inifile.Free;
        }
    } else {
        return defaultValue;
    }
}

function setValueToInifile(iniFileName) {
    var IniFile = TIniFile.Create(iniFileName);
    IniFile.WriteString("General", "Directory", TEditCurrentPcbPath.Text);
    IniFile.WriteBool("General", "IncludeTracksAndSolidPolygons", CbIncludeTracksAndSolidPolygons.Checked);
    IniFile.WriteBool("General", "IncludeVias", CbIncludeVias.Checked);
    IniFile.WriteBool("General", "IncludeHatched", CbIncludeHatched.Checked);
    IniFile.WriteBool("General", "IncludeNets", CbIncludeNets.Checked);
    IniFile.WriteBool("General", "BlacklistDNP", CbBlacklistDNP.Checked);
    IniFile.WriteBool("General", "Blacklist1Pad", CbBlacklist1Pad.Checked);

    IniFile.WriteBool("HtmlDefaults", "DarkMode", CbDarkMode.Checked);
    IniFile.WriteBool("HtmlDefaults", "ShowFootprintPads", CbShowFootprintPads.Checked);
    IniFile.WriteBool("HtmlDefaults", "ShowFabricationLayer", CbShowFabricationLayer.Checked);
    IniFile.WriteBool("HtmlDefaults", "ShowSilkscreen", CbShowSilkscreen.Checked);
    IniFile.WriteBool("HtmlDefaults", "HighlightFirstPin", CbHighlightFirstPin.Checked);
    IniFile.WriteBool("HtmlDefaults", "ContinuousRedrawOnDrag", CbContinuousRedrawOnDrag.Checked);
    IniFile.WriteInteger("HtmlDefaults", "PcbRotation", TTrackBarRotation.Position);
    IniFile.WriteString("HtmlDefaults", "HtmlCheckboxes", TEditHtmlCheckboxes.Text);
    IniFile.WriteBool("HtmlDefaults", "BomViewOnly", RBtnBomOnly.Checked);
    IniFile.WriteBool("HtmlDefaults", "BomViewLeftDrawingRight", RBtnBomLeftDrawingRight.Checked);
    IniFile.WriteBool("HtmlDefaults", "BomViewTopDrawingBottom", RBtnBomTopDrawingBottom.Checked);
    IniFile.WriteBool("HtmlDefaults", "PcbLayerFrontOnly", RBtnFrontOnly.Checked);
    IniFile.WriteBool("HtmlDefaults", "PcbLayerFrontAndBack", RBtnFrontAndBack.Checked);
    IniFile.WriteBool("HtmlDefaults", "PcbLayerBackOnly", RBtnBackOnly.Checked);
    IniFile.WriteBool("HtmlDefaults", "OtherOpenBrowser", CbOpenBrowser.Checked);
    IniFile.WriteBool("HtmlDefaults", "OtherOpenExplorer", CbOpenExplorer.Checked);

    IniFile.WriteString("ExtraFields", "ExtraFileName", TEditExtraFileName.Text);
    IniFile.Free;
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


