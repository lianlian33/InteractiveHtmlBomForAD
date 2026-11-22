
function startWin() {
    mainWin.Show(); 
}

function setChineseCaptions() {
    TabSheet1.Caption = "\u5E38\u89C4";
    GroupBox1.Caption = "BOM \u8F93\u51FA\u4F4D\u7F6E";
    StaticText1.Caption = "\u76EE\u5F55";
    GroupBox3.Caption = "PCB \u9644\u52A0\u6570\u636E";
    CbIncludeTracksAndSolidPolygons.Caption = "\u5305\u542B\u8D70\u7EBF/\u5B9E\u5FC3\u533A\u57DF";
    CbIncludeVias.Caption = "\u5305\u542B\u8FC7\u5B54";
    CbIncludeHatched.Caption = "\u5305\u542B\u7F51\u683C\u94FA\u94DC";
    CbIncludeNets.Caption = "\u5305\u542B\u7F51\u7EDC";
    GroupBox4.Caption = "\u6392\u9664\u5143\u4ef6";
    CbBlacklistEmpty.Caption = "Comment\u662F\"DNP\"\u6216\"~\"\u7684\u5143\u4EF6";
    CbBlacklist1Pad.Caption = "\u5355\u710A\u76D8\u5143\u4EF6";
    CbBlacklistTh.Caption = "\u76F4\u63D2\uFF08TH\uFF09\u5143\u4EF6";
    GenerateBom.Caption = "\u751F\u6210 IBOM";
    GroupBox10.Caption = "PCB \u677F\u6846\u5C42";
    RBtnKeepOutLayer.Caption = "Keep-Out \u5C42";
    RBtnMech1.Caption = "\u673a\u68b0 1 \u5c42";
    TabSheet2.Caption = "HTML \u9ED8\u8BA4\u8BBE\u7F6E";
    CbDarkMode.Caption = "\u6DF1\u8272\u6A21\u5F0F";
    CbShowFootprintPads.Caption = "\u663E\u793A\u5C01\u88C5\u710A\u76D8";
    CbShowFabricationLayer.Caption = "\u663E\u793A\u5236\u9020\u5C42";
    CbShowSilkscreen.Caption = "\u663E\u793A\u4E1D\u5370";
    CbHighlightFirstPin.Caption = "\u9AD8\u4EAE 1 \u53F7\u5F15\u811A";
    CbContinuousRedrawOnDrag.Caption = "\u62D6\u52A8\u65F6\u8FDE\u7EED\u91CD\u7ED8";
    GroupBox5.Caption = "BOM \u590D\u9009\u6846";
    StaticText2.Caption = "PCB \u65CB\u8F6C\u89D2\u5EA6";
    GroupBox6.Caption = "BOM \u89C6\u56FE";
    RBtnBomOnly.Caption = "\u4EC5 BOM";
    RBtnBomLeftDrawingRight.Caption = "BOM \u5728\u5DE6\uFF0CPCB \u5728\u53F3";
    RBtnBomTopDrawingBottom.Caption = "BOM \u5728\u4E0A\uFF0CPCB \u5728\u4E0B";
    GroupBox7.Caption = "\u5C42\u89C6\u56FE";
    RBtnFrontAndBack.Caption = "\u9876\u5C42\u548C\u5E95\u5C42";
    RBtnFrontOnly.Caption = "\u4EC5\u663E\u793A\u9876\u5C42";
    RBtnBackOnly.Caption = "\u4EC5\u663E\u793A\u5E95\u5C42";
    GroupBox8.Caption = "\u751F\u6210\u540E\u64CD\u4F5C";
    CbOpenBrowser.Caption = "\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00";
    CbOpenExplorer.Caption = "\u6253\u5F00\u6240\u5728\u6587\u4EF6\u5939";
}

function mainWinShow(Sender) {
    setChineseCaptions();
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
        CbIncludeHatched.Checked = false;
        CbIncludeNets.Checked = iniFile.ReadBool("General", "IncludeNets", false);

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
        CbOpenBrowser.Checked = iniFile.ReadBool("HtmlDefaults", "OtherOpenBrowser", false);
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
    LblExportDone.Caption = "";
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
    config.htmlConfig["settings_version"] = String(new Date().getTime());

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
    LblExportDone.Caption = "\u5BFC\u51FA\u5B8C\u6210";

    if (CbOpenExplorer.Checked) {
        try {
            var folder = ExtractFilePath(filename);
            if (folder.length > 3 && folder.charAt(folder.length - 1) == "\\") {
                folder = folder.substring(0, folder.length - 1);
            }
            var commandline = "explorer.exe \"" + folder + "\"";
            var errcode = RunApplication(commandline);
        }
        catch(e) {
            showmessage(e.message);
        };
    }
    if (CbOpenBrowser.Checked) {
        try {
            var shell = new ActiveXObject("Shell.Application");
            shell.ShellExecute(filename, "", "", "open", 1);
        }
        catch(e) {
            showmessage(e.message);
        };
    }
}

function pickBom(pcb, config, extra_data) {
    // type (list, dict, dict) -> dict
    // return: dict of BOM tables (qty, value, footprint, refs) and dnp components
    var extra_data = arguments[2] ? arguments[2] : {}; 

    var res = {};
    res["has_schematic"] = pcb["has_schematic"] !== false;
    var extras = [];
    var modules = pcb.modules;
    var rows = {};  // { itemkey: [quantity, value, footprint, refs, extras, comment] }
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

            rows[modules[i].itemkey] = [1, modules[i]["component"].val, modules[i]["component"].footprint, [[modules[i]["component"].ref, i]], extras, modules[i]["component"].comment || ""];
            rows[modules[i].itemkey][7] = [modules[i]["component"].linkdesc || "", modules[i]["component"].linkurl || ""];
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
        rowsF[i].push(rows[i][5]); // add comment
        rowsF[i][7] = rows[i][7];
        res.F.push(rowsF[i]);
    }

    res.B = []
    for (var i in rowsB) {
        rowsB[i].push(rows[i][4]); 
        rowsB[i].push(rows[i][5]); // add comment
        rowsB[i][7] = rows[i][7];
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
    var filename = String(text).replace(/\//g, "\\");
    var arr = filename.split("\\");
    var len = arr.length - 1;
    var root = arr[0];
    var start = 1;

    if (filename.indexOf("\\\\") == 0) {
        // UNC path (\\server\share\...): the first two empty segments are part of the prefix
        if (len < 3 || arr[2] == "" || arr[3] == "") {
            showmessage("Directory error");
            return "";
        }
        root = "\\\\" + arr[2] + "\\" + arr[3];
        start = 4;
    }

    if (!fso.FolderExists(root)) {
        showmessage("Directory error");
        return "";
    }

    for (var i = start; i <= len; i++) {
        if (arr[i] == "") {
            showmessage("Directory error");
            return "";
        }
    }

    return filename;
}

