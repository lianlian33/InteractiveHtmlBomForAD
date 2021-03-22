/// export
///
function exportJSON() {  // export json of pcb without attr "bom" & "ibom_version"
    var res = {};
    var pcb = parsePcb();
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
    var filename = pcb.boardpath + "PnPout\\" + pcb.boardname.split(".")[0] + ".json";
    save2file(s, filename, true);

    try {
        var commandline = "explorer.exe " + ExtractFilePath(filename);
        var errcode = RunApplication(commandline);
    }
    catch(e) {
        showmessage(e.message);
    };
}


function exportBOM() {
    var pcb = parsePcb();
    if (!pcb) {
        return;
    };
    var modules = pcb.modules;
    var count = modules.length ;
    var rows = {};
    var rowsDNP = {};
    for (var i = 0; i < count; i++) {
        if (skipComponent(modules[i])) {
            if (modules[i]["footprint"].pads.length <= 1) {
                continue;
            }

            if (!rowsDNP.hasOwnProperty(modules[i].itemkey)) {
                rowsDNP[modules[i].itemkey] = [modules[i]["component"].val, modules[i].soldertype, modules[i]["component"].footprint, " ", 1, " ", [modules[i]["component"].ref], " ", [], []];
            } else {
                rowsDNP[modules[i].itemkey][4]++;
                rowsDNP[modules[i].itemkey][6].push(modules[i]["component"].ref);
            }

            if (modules[i]["component"].layer == "F") {
                rowsDNP[modules[i].itemkey][8].push(modules[i]["component"].ref);
            } else {
                rowsDNP[modules[i].itemkey][9].push(modules[i]["component"].ref);
            }           
            continue;
        }

        if (!rows.hasOwnProperty(modules[i].itemkey)) {
            rows[modules[i].itemkey] = [modules[i]["component"].val, modules[i].soldertype, modules[i]["component"].footprint, " ", 1, " ", [modules[i]["component"].ref], " ", [], []];
        } else {
            rows[modules[i].itemkey][4]++;
            rows[modules[i].itemkey][6].push(modules[i]["component"].ref);
        }

        if (modules[i]["component"].layer == "F") {
            rows[modules[i].itemkey][8].push(modules[i]["component"].ref);
        } else {
            rows[modules[i].itemkey][9].push(modules[i]["component"].ref);
        }
    }    

    var res = [];
    var filename = pcb.boardpath + "PnPout\\" + pcb.boardname.split(".")[0] + ".txt";
    res.push(["Comment", "Soldertype", "Footprint", " ", "Quantity", " ", "Designator", " ", "TopLayer", "BtmLayer"].join("\t"));
    for (var i in rows) {
        rows[i][6]= rows[i][6].join(",");
        rows[i][8]= rows[i][8].join(",");
        rows[i][9]= rows[i][9].join(",");
        res.push(rows[i].join("\t"));
    }

    for (var i in rowsDNP) {
        rowsDNP[i][6]= rowsDNP[i][6].join(",");
        rowsDNP[i][8]= rowsDNP[i][8].join(",");
        rowsDNP[i][9]= rowsDNP[i][9].join(",");
        res.push(rowsDNP[i].join("\t"));
    }

    save2file(res.join("\n"), filename, false);

    var commandline = "notepad.exe " + filename;
    var errcode = RunApplication(commandline);
}

function exportPnP() {
    var pcb = parsePcb();
    if (!pcb) {
        return;
    };
    var modules = pcb.modules;
    var count = modules.length; 
    var rowsF = {};
    var rowsB = {};
    var rowsDNP = {};
    for (var i = 0; i < count; i++) {
        if (skipComponent(modules[i])) {
            if (modules[i]["footprint"].pads.length <= 1) {
                continue;
            }

            if (!rowsDNP.hasOwnProperty(modules[i].itemkey)) {
                rowsDNP[modules[i].itemkey] = [i];
            } else {
                rowsDNP[modules[i].itemkey].push(i);
            }     
            continue;
        }

        if (modules[i]["component"].layer == "F") {
            if (!rowsF.hasOwnProperty(modules[i].itemkey)) {
                rowsF[modules[i].itemkey] = [i];
            } else {
                rowsF[modules[i].itemkey].push(i);
            }
        } else {
            if (!rowsB.hasOwnProperty(modules[i].itemkey)) {
                rowsB[modules[i].itemkey] = [i];
            } else {
                rowsB[modules[i].itemkey].push(i);
            }
        }
    }    

    var res = [];
    // res.push(["Designator", "Footprint", "Mid X", "Mid Y", "Ref X", "Ref Y", "Pad X", "Pad Y", "Layer", "Rotation", "Comment"].join(","));
    res.push(["Designator", "Footprint", "Mid X", "Mid Y", "Layer", "Rotation", "Comment"].join(","));
    for (var i in rowsF) {
        var lenF = rowsF[i].length;
        for (var k = 0; k < lenF; k++) {
            res.push([modules[rowsF[i][k]]["component"].ref, modules[rowsF[i][k]]["component"].footprint, [(modules[rowsF[i][k]]["footprint"].center[0] - pcb.pos[0]).toFixed(2), "mm"].join("") , [(-modules[rowsF[i][k]]["footprint"].center[1] - pcb.pos[1]).toFixed(2), "mm"].join(""), "T", modules[rowsF[i][k]].angle, modules[rowsF[i][k]]["component"].val].join(","));
        }
    }

    for (var i in rowsB) {
        var lenB = rowsB[i].length;
        for (var k = 0; k < lenB; k++) {
            res.push([modules[rowsB[i][k]]["component"].ref, modules[rowsB[i][k]]["component"].footprint, [(modules[rowsB[i][k]]["footprint"].center[0] - pcb.pos[0]).toFixed(2), "mm"].join("") , [(-modules[rowsB[i][k]]["footprint"].center[1] - pcb.pos[1]).toFixed(2), "mm"].join(""), "B", modules[rowsB[i][k]].angle, modules[rowsB[i][k]]["component"].val].join(","));
        }
    }

    for (var i in rowsDNP) {
        var lenD = rowsDNP[i].length;
        for (var k = 0; k < lenD; k++) {
            res.push([modules[rowsDNP[i][k]]["component"].ref, modules[rowsDNP[i][k]]["component"].footprint, [(modules[rowsDNP[i][k]]["footprint"].center[0] - pcb.pos[0]).toFixed(2), "mm"].join("") , [(-modules[rowsDNP[i][k]]["footprint"].center[1] - pcb.pos[1]).toFixed(2), "mm"].join(""), modules[rowsDNP[i][k]]["component"].layer, modules[rowsDNP[i][k]].angle, modules[rowsDNP[i][k]]["component"].val].join(","));
        }
    }

    var filename = pcb.boardpath + "PnPout\\" + pcb.boardname.split(".")[0] + ".csv";
    save2file(res.join("\n"), filename, false);

    try {
        var commandline = "explorer.exe " + ExtractFilePath(filename);
        var errcode = RunApplication(commandline);
    }
    catch(e) {
        showmessage(e.message);
    };
}
