/// export
///

// quote a CSV field when it contains a comma, quote or line break
function csvField(v) {
    v = String(v);
    if (v.indexOf(",") >= 0 || v.indexOf("\"") >= 0 || v.indexOf("\n") >= 0 || v.indexOf("\r") >= 0) {
        v = "\"" + v.split("\"").join("\"\"") + "\"";
    }
    return v;
}

function csvLine(cells) {
    var out = [];
    for (var i = 0; i < cells.length; i++) {
        out.push(csvField(cells[i]));
    }
    return out.join(",");
}

// open the folder of a file in explorer, quoted and without the trailing backslash
function openFolder(filename) {
    var folder = ExtractFilePath(filename);
    if (folder.length > 3 && folder.charAt(folder.length - 1) == "\\") {
        folder = folder.substring(0, folder.length - 1);
    }
    return RunApplication("explorer.exe \"" + folder + "\"");
}

function exportJSON() {  // export json of pcb without attr "bom" & "ibom_version"
    var res = {};
    var config = getConfig();
    var pcb = parsePcb(config);
    if (!pcb) {
        return;
    };

    res["components"] = [];
    var kk = pcb.modules.length;
    for (var n = 0; n < kk; n++) {
        res["components"].push(pcb.modules[n].component);
    }

    res["pcbdata"] = pcb.pcbdata;
    // res["pcbdata"]["modules"] = res["pcbdata"]["footprints"]; 
    // delete res["pcbdata"].footprints;
    res["source"] = "AD10";
    var s = JSON.stringify(res);
    var filename = pcb.boardpath + "IBOMForAD_Out\\" + pcb.boardname.split(".")[0] + ".json";
    save2file(s, filename, true);

    try {
        openFolder(filename);
    }
    catch(e) {
        showmessage(e.message);
    };
}


function exportBOM() {
    var config = getConfig();
    var pcb = parsePcb(config);
    if (!pcb) {
        return;
    };
    var modules = pcb.modules;
    var count = modules.length ;
    var rows = {};
    var rowsDNP = {};
    for (var i = 0; i < count; i++) {
        if (skipComponent(modules[i], config)) {
            if (modules[i]["footprint"].pads.length <= 1) {
                continue;
            }

            if (!Object.prototype.hasOwnProperty.call(rowsDNP, modules[i].itemkey)) {
                rowsDNP[modules[i].itemkey] = [modules[i]["component"].comment, modules[i]["component"].val, modules[i].soldertype, modules[i]["component"].footprint, 1, [modules[i]["component"].ref], [], []];
            } else {
                rowsDNP[modules[i].itemkey][4]++;
                rowsDNP[modules[i].itemkey][5].push(modules[i]["component"].ref);
            }

            if (modules[i]["component"].layer == "F") {
                rowsDNP[modules[i].itemkey][6].push(modules[i]["component"].ref);
            } else {
                rowsDNP[modules[i].itemkey][7].push(modules[i]["component"].ref);
            }           
            continue;
        }

        if (!Object.prototype.hasOwnProperty.call(rows, modules[i].itemkey)) {
            rows[modules[i].itemkey] = [modules[i]["component"].comment, modules[i]["component"].val, modules[i].soldertype, modules[i]["component"].footprint, 1, [modules[i]["component"].ref], [], []];
        } else {
            rows[modules[i].itemkey][4]++;
            rows[modules[i].itemkey][5].push(modules[i]["component"].ref);
        }

        if (modules[i]["component"].layer == "F") {
            rows[modules[i].itemkey][6].push(modules[i]["component"].ref);
        } else {
            rows[modules[i].itemkey][7].push(modules[i]["component"].ref);
        }
    }

    var res = [];
    var filename = pcb.boardpath + "IBOMForAD_Out\\" + pcb.boardname.split(".")[0] + "_BOM.csv";
    res.push(csvLine(["Comment", "Value", "Soldertype", "Footprint", "Quantity", "Designator", "TopLayer", "BtmLayer"]));
    for (var i in rows) {
        rows[i][5]= rows[i][5].join(",");
        rows[i][6]= rows[i][6].join(",");
        rows[i][7]= rows[i][7].join(",");
        res.push(csvLine(rows[i]));
    }

    for (var i in rowsDNP) {
        rowsDNP[i][5]= rowsDNP[i][5].join(",");
        rowsDNP[i][6]= rowsDNP[i][6].join(",");
        rowsDNP[i][7]= rowsDNP[i][7].join(",");
        res.push(csvLine(rowsDNP[i]));
    }

    save2file(res.join("\n"), filename, false);

    try {
        openFolder(filename);
    }
    catch(e) {
        showmessage(e.message);
    };
}

function exportPnP() {
    var config = getConfig();
    var pcb = parsePcb(config);
    if (!pcb) {
        return;
    };
    var modules = pcb.modules;
    var count = modules.length; 
    var rowsF = {};
    var rowsB = {};
    var rowsDNP = {};
    for (var i = 0; i < count; i++) {
        if (skipComponent(modules[i], config)) {
            if (modules[i]["footprint"].pads.length <= 1) {
                continue;
            }

            if (!Object.prototype.hasOwnProperty.call(rowsDNP, modules[i].itemkey)) {
                rowsDNP[modules[i].itemkey] = [i];
            } else {
                rowsDNP[modules[i].itemkey].push(i);
            }     
            continue;
        }

        if (modules[i]["component"].layer == "F") {
            if (!Object.prototype.hasOwnProperty.call(rowsF, modules[i].itemkey)) {
                rowsF[modules[i].itemkey] = [i];
            } else {
                rowsF[modules[i].itemkey].push(i);
            }
        } else {
            if (!Object.prototype.hasOwnProperty.call(rowsB, modules[i].itemkey)) {
                rowsB[modules[i].itemkey] = [i];
            } else {
                rowsB[modules[i].itemkey].push(i);
            }
        }
    }    

    var res = [];
    // res.push(["Designator", "Footprint", "Mid X", "Mid Y", "Ref X", "Ref Y", "Pad X", "Pad Y", "Layer", "Rotation", "Comment"].join(","));
    res.push(csvLine(["Designator", "Footprint", "Mid X", "Mid Y", "Layer", "Rotation", "Comment"]));
    for (var i in rowsF) {
        var lenF = rowsF[i].length;
        for (var k = 0; k < lenF; k++) {
            res.push(csvLine([modules[rowsF[i][k]]["component"].ref, modules[rowsF[i][k]]["component"].footprint, [(modules[rowsF[i][k]]["footprint"].center[0] - pcb.pos[0]).toFixed(2), "mm"].join("") , [(-modules[rowsF[i][k]]["footprint"].center[1] - pcb.pos[1]).toFixed(2), "mm"].join(""), "T", modules[rowsF[i][k]].angle, modules[rowsF[i][k]]["component"].comment]));
        }
    }

    for (var i in rowsB) {
        var lenB = rowsB[i].length;
        for (var k = 0; k < lenB; k++) {
            res.push(csvLine([modules[rowsB[i][k]]["component"].ref, modules[rowsB[i][k]]["component"].footprint, [(modules[rowsB[i][k]]["footprint"].center[0] - pcb.pos[0]).toFixed(2), "mm"].join("") , [(-modules[rowsB[i][k]]["footprint"].center[1] - pcb.pos[1]).toFixed(2), "mm"].join(""), "B", modules[rowsB[i][k]].angle, modules[rowsB[i][k]]["component"].comment]));
        }
    }

    for (var i in rowsDNP) {
        var lenD = rowsDNP[i].length;
        for (var k = 0; k < lenD; k++) {
            res.push(csvLine([modules[rowsDNP[i][k]]["component"].ref, modules[rowsDNP[i][k]]["component"].footprint, [(modules[rowsDNP[i][k]]["footprint"].center[0] - pcb.pos[0]).toFixed(2), "mm"].join("") , [(-modules[rowsDNP[i][k]]["footprint"].center[1] - pcb.pos[1]).toFixed(2), "mm"].join(""), modules[rowsDNP[i][k]]["component"].layer == "F" ? "T" : "B", modules[rowsDNP[i][k]].angle, modules[rowsDNP[i][k]]["component"].comment]));
        }
    }

    var filename = pcb.boardpath + "IBOMForAD_Out\\" + pcb.boardname.split(".")[0] + "_PnP.csv";
    save2file(res.join("\n"), filename, false);

    try {
        openFolder(filename);
    }
    catch(e) {
        showmessage(e.message);
    };
}
