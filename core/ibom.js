/// ibom.js
///
 
/*
module = {
    "angle": xx,
    "itemkey": xx,
    "soldertype": xx,
    "footprint": {xx..}
    "comment": {xx..}
}
*/
function skipComponent(m, config, extra_data) {
    // config = config || {};
    // config.bomFilter.skiplist = [];
    // config.bomFilter.skipvirtual = true;
    // config.bomFilter.dnpfield = true;
    // config.bomFilter.skiplayer = true;

    // extra_data = extra_data || {};
    // var re = /^[A-Z]*/g;
    // var ref_prefix = re.exec(m["component"].ref);
    // if (m["component"].ref in config.bomFilter.skiplist) {
    //     return true;
    // }
    // if (ref_prefix + "*" in config.bomFilter.skiplist) {
    //     return true;
    // } 
    // skip component with empty comment (component.val is now the schematic "Value"
    // parameter, so the DNP marker is looked up in the Comment)
    if (config.bomFilter.skipempty && m["component"].comment in {"DNP": 1, "~": 2}) {
        return true;
    }
    // skip virtual components
    // if (config.bomFilter.skipvirtual && m["component"].attr == "virtual") {
    //     return true;
    // }
    // skip components with one pad
    if (config.bomFilter.skiponepad && m["footprint"].pads.length <= 1) {
        return true;
    }
    // skip components with dnp field not empty
    // if (config.bomFilter.dnpfield && extra_data[m["component"].ref][config.dnpfield]) {
    //     return true;
    // }
    // skip th components
    if (config.bomFilter.skipth && m.soldertype == "th") {
        return true;
    }
    // skip components on layer, "F" or "B"
    // if (config.bomFilter.skiplayer == m["component"].layer) {
    //     return true;
    // }
}


function sortModules(modules) {
    function mergeModules (iBegin, iMid, iEnd) {
        var tmp = [];
        var j = iBegin;
        var n = iMid;
        var k = iMid + 1;
        while (j <= n && k <= iEnd) {

            // sort: smd > th
            if (modules[j].soldertype != modules[k].soldertype) {
                if (modules[j].soldertype == "smd") {
                    tmp.push(modules[j]);
                    j++;
                    continue;
                }
                if (modules[k].soldertype == "smd") {
                    tmp.push(modules[k]);
                    k++;
                    continue;
                }
            }

            // sort by itemkey
            if (modules[j].itemkey < modules[k].itemkey) {
                tmp.push(modules[j]);
                j++;
            } else if (modules[j].itemkey == modules[k].itemkey) {
                if (modules[j]["component"].ref.length < modules[k]["component"].ref.length) {
                    tmp.push(modules[j]);
                    j++;
                } else if (modules[j]["component"].ref.length == modules[k]["component"].ref.length && modules[j]["component"].ref < modules[k]["component"].ref) {
                    tmp.push(modules[j]);
                    j++;
                } else {
                    tmp.push(modules[k]);
                    k++;
                }
            } else {
                tmp.push(modules[k]);
                k++;
            }
        }   

        while (j <= n) {
            tmp.push(modules[j]);
            j++;
        }   

        while (k <= iEnd) {
            tmp.push(modules[k]);
            k++;
        }   

        k = tmp.length;
        for (var i = 0; i < k; i++) {
            if (modules[iBegin + i]["component"].ref != tmp[i]["component"].ref) {
                modules[iBegin + i] = tmp[i];
            }
        }       
    }

    var len = modules.length;
    var dt = 1;
    while (dt < len) {
        var i = 0;
        while (i < len - dt) {
            if (i + 2 * dt < len) {
                mergeModules(i, i + dt - 1, i + 2 * dt - 1);
            } else {
                mergeModules(i, i + dt - 1, len - 1);
            }
            i = i + 2 * dt;
        }
        dt = 2 * dt;
    }
    return modules;
};


function generateBom(pcb, config, extra_data) {
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


function save2file(src, filename, noBOM) {
    var noBOM = arguments[2] ? arguments[2] : false; 
    var fso = new ActiveXObject("Scripting.FileSystemObject"); 
    var filename = String(filename).replace(/\//g, "\\");
    var arrFolder = filename.split("\\");
    var len = arrFolder.length - 1;
    var folder = "";
    var start = 0;

    if (arrFolder[len] == "") {
        showmessage("path error");
        return;
    }

    if (filename.indexOf("\\\\") == 0) {
        // UNC path (\\server\share\...): keep the \\server\share prefix, it can't be created
        if (len < 3 || arrFolder[2] == "" || arrFolder[3] == "") {
            showmessage("path error");
            return;
        }
        folder = "\\\\" + arrFolder[2] + "\\" + arrFolder[3] + "\\";
        start = 4;
    }

    for (var i = start; i < len; i++) {
        if (arrFolder[i] == "") {
            showmessage("path error");
            return;
        }
        folder = folder + arrFolder[i];
        if (!fso.FolderExists(folder)) {
            fso.CreateFolder(folder);
        }
        folder = folder + "\\"; 
    }
    // var folder = ExtractFilePath(filename);
    // if (!fso.FolderExists(folder)) {
    //     fso.CreateFolder(folder);
    // } 

    if (fso.FileExists(filename)) {
        try {
            fso.DeleteFile(filename, true);
        }
        catch (e) {
            showmessage(e.message);
        }
    }

    var stm = new ActiveXObject("Adodb.Stream");
    stm.Type = 2;
    stm.Mode = 3;
    stm.Open();
    stm.Charset = "utf-8";
    
    stm.Position = stm.Size;
    stm.WriteText(src);
    
    if (noBOM) {
        // remove the BOM head
        stm.Position = 3;
        var newstm = new ActiveXObject("Adodb.Stream");
        newstm.Mode = 3;
        newstm.Type = 1;
        newstm.Open();
        stm.CopyTo(newstm);
        newstm.SaveToFile(filename, 2);      
        newstm.flush();
        newstm.Close();
    } else {
        stm.SaveToFile(filename, 2);      
        stm.flush();
        stm.Close();     
    }
}

function loadfile(filename) {
    var stm = new ActiveXObject("Adodb.Stream");
    stm.Type = 2;
    stm.Mode = 3;
    stm.Open();
    stm.Charset = "utf-8";
    stm.Position = stm.Size;

    var fso = new ActiveXObject("Scripting.FileSystemObject"); 
    if (!fso.FileExists(filename)) {
        s = "";
    }
    else {
        stm.LoadFromFile(filename);
        var s = stm.ReadText();    
    }
    stm.flush();
    stm.Close();
    return s;
}


function generateFile(compressed_pcbdata, config_js) {
    var filepath = CURRENT_PATH + "web\\";

    var html = loadfile(filepath + "ibom.html");
    html = html.replace("///CSS///", loadfile(filepath + "ibom.css"));
    html = html.replace("///SPLITJS///", loadfile(filepath + "split.js"));
    html = html.replace("///LZ-STRING///", loadfile(filepath + "lz-string.js"));
    html = html.replace("///POINTER_EVENTS_POLYFILL///", loadfile(filepath + "pep.js"));
    html = html.replace("///CONFIG///", config_js);
    html = html.replace("///PCBDATA///", compressed_pcbdata);
    html = html.replace("///UTILJS///", loadfile(filepath + "util.js"));
    html = html.replace("///RENDERJS///", loadfile(filepath + "render.js"));
    html = html.replace("///IBOMJS///", loadfile(filepath + "ibom.js"));

    html = html.replace("///USERCSS///", loadfile(filepath + "user.css"));
    html = html.replace("///USERJS///", loadfile(filepath + "user.js"));
    html = html.replace("///USERHEADER///", loadfile(filepath + "userheader.html"));
    html = html.replace("///USERFOOTER///", loadfile(filepath + "userfooter.html"));
   
    return html;
}


function loadExtraData(filename) {
    var s = loadfile(filename);
    if (s == "") {
        return {};
    }
    var d = JSON.parse(s);
    //d = {"123": "C1,C2", "332": "R1"}

    //    {
    //       ref1: {
    //         field_name1: field_value1,
    //         field_name2: field_value2,
    //         ...
    //         },
    //       ref2: ...
    //    }
    var extra_data = {};
    for (var key in d) {
        var ref = d[key].split(",")[0];
        extra_data[ref] = {};
        extra_data[ref]["Num."] = key;
    }
    return extra_data;
}


function main() {
    var config = getConfig();
    var pcb = parsePcb(config);
    if (!pcb) {
        return;
    };
    
    var filename = pcb.boardpath + "IBOMForAD_Out\\" + "extra_data.txt";
    // var extra_data = loadExtraData(filename);
    var extra_data;

    pcb.pcbdata["bom"] = generateBom(pcb, config, extra_data);
    pcb.pcbdata["ibom_version"] = "v2.3";

    // var t1 = new Date().getTime();

    var s = JSON.stringify(pcb.pcbdata);
    // var t2 = new Date().getTime();
    var b = LZStr.compressToBase64(s);
    // var t3 = new Date().getTime();
    // showmessage("t1: "+String(t1-t0)+"   t2: "+String(t2-t1)+"   t3: "+String(t3-t2));

    b = 'var pcbdata = JSON.parse(LZString.decompressFromBase64("' + b + '"))';

    config.htmlConfig["settings_version"] = String(new Date().getTime());
    var config_js = "var config = " + JSON.stringify(config.htmlConfig);
    var html = generateFile(b, config_js);
    filename = pcb.boardpath + "IBOMForAD_Out\\" + pcb.boardname.split(".")[0] + "_IBOM.html";
    save2file(html, filename, false);

    try {
        var commandline = "explorer.exe " + ExtractFilePath(filename);
        var errcode = RunApplication(commandline);
    }
    catch(e) {
        showmessage(e.message);
    };
}
