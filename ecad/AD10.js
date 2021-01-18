
/// AD10.js
/// 
function Normalize(coord) {
    return Math.round(0.0254 * coord / 100) / 100;
    // return num / 10000;
}

function RoundNum(num) {
    return Math.round(num * 100) / 100;
}

/// 
function parsePcb(non) {
    //"use strict";
    var pcb = {}; 
    pcb["pcbdata"] = {};
    pcb["tracks"] = [];
    pcb["texts"] = [];
    pcb["pads"] = [];
    pcb["vias"] = [];
    pcb["arcs"] = [];
    pcb["modules"] = [];
    pcb["fills"] = [];
    pcb["regions"] = [];
    pcb["polygons"] = [];

    pcb["pos"] = [];

    pcb["Layers"] = {};
    pcb.Layers.OUTLINE_LAYER = String2Layer("Keep Out Layer");
    // pcb.Layers.OUTLINE_LAYER = eMechanical1;
    pcb.Layers.INFO_LAYER = eMechanical2;
    pcb.Layers.TOP_DIMENSIONS_LAYER = eMechanical11;
    pcb.Layers.BOT_DIMENSIONS_LAYER = eMechanical12;
    pcb.Layers.TOP_MECH_BODY_LAYER = eMechanical13;
    pcb.Layers.BOT_MECH_BODY_LAYER = eMechanical14;
    pcb.Layers.TOP_COURTYARD_LAYER = eMechanical15;
    pcb.Layers.BOT_COURTYARD_LAYER = eMechanical16;
    pcb.Layers.UNUSED_LAYERS = MkSet(eMechanical3, eMechanical4, eMechanical5, eMechanical6, eMechanical7, eMechanical8, eMechanical9, eMechanical10);
    pcb.Layers.TOP_OVERLAY_LAYER = String2Layer("Top Overlay");
    pcb.Layers.BOT_OVERLAY_LAYER = String2Layer("Bottom Overlay");
    pcb.Layers.TOP_SOLDERMASK_LAYER = String2Layer("Top Solder Mask");
    pcb.Layers.BOT_SOLDERMASK_LAYER = String2Layer("Bottom Solder Mask");
    pcb.Layers.TOP_PASTE_LAYER = String2Layer("Top Paste");
    pcb.Layers.BOT_PASTE_LAYER = String2Layer("Bottom Paste");
    pcb.Layers.DRILL_GUIDE_LAYER = String2Layer("Drill Guide");
    pcb.Layers.DRILL_DRAWING_LAYER = String2Layer("Drill Drawing");
    pcb.Layers.KEEP_OUT_LAYER = String2Layer("Keep Out Layer");
    pcb.Layers.MULTI_LAYER = String2Layer("Multi Layer");

    Number.prototype.decimal2 = function anonymFun_map(non) {
        return Math.round(this * 100) / 100;
    };


    function parseTrack(Prim) {
        var res = {};
        res["type"] = "segment";
        res["start"] = [Normalize(Prim.x1), -Normalize(Prim.y1)];
        res["end"] = [Normalize(Prim.x2), -Normalize(Prim.y2)];
        res["width"] = Normalize(Prim.Width);
        res["layer"] = Prim.Layer;
        // res.net = "";
        return res;
    }

    function parseArc(Prim) {
        var res = {};
        res["type"] = "arc";
        res["width"] = Normalize(Prim.LineWidth);

        res["startangle"] = -RoundNum(Prim.EndAngle);
        res["endangle"] = -RoundNum(Prim.StartAngle);
        res["start"] = [Normalize(Prim.XCenter), -Normalize(Prim.YCenter)];
        res["radius"] = Normalize(Prim.Radius);
        res["layer"] = Prim.Layer;
        // res.net = "";
        // 
        function arc2svg(cx, cy, radius, startangle, endangle) {
            var startrad = startangle * Math.PI / 180;
            var endrad = endangle * Math.PI / 180;
            var start = [cx + (radius * Math.cos(startrad)), cy + (radius * Math.sin(startrad))];
            var end = [cx + (radius * Math.cos(endrad)), cy + (radius * Math.sin(endrad))];

            if (start[0] == end[0] && start[1] == end[1]) {
                var d = ["M", cx - radius, -cy, "a", radius, radius, 0, 1, 0, 2*radius, 0, "a", radius, radius, 0, 1, 0, -2*radius, 0].join(" ");
                return d;
            }

            var da = startangle > endangle ? endangle - startangle + 360 : endangle - startangle;
            var largeArcFlag = da <= 180 ? "0" : "1";
            var sweepFlag = 0;
            var d = ["M", start[0], -start[1], "A", radius, radius, 0, largeArcFlag, sweepFlag, end[0], -end[1]].join(" ");

            return d;            
        }

        function arc2outline(cx, cy, radius, startangle, endangle, width) {
            var startrad = startangle * Math.PI / 180;
            var endrad = endangle * Math.PI / 180;

            var r0 = width / 2;
            var r1 = radius + r0;
            var r2 = radius - r0;
            var start1 = [cx + (r1 * Math.cos(startrad)), cy + (r1 * Math.sin(startrad))];
            var end1 = [cx + (r1 * Math.cos(endrad)), cy + (r1 * Math.sin(endrad))];   
            var start2 = [cx + (r2 * Math.cos(startrad)), cy + (r2 * Math.sin(startrad))];
            var end2 = [cx + (r2 * Math.cos(endrad)), cy + (r2 * Math.sin(endrad))];  

            var da = startangle > endangle ? endangle - startangle + 360 : endangle - startangle;
            var largeArcFlag = da <= 180 ? "0" : "1";
            var sweepFlag = 0;
            var arc1 = ["M", start1[0], -start1[1], "A", r1, r1, 0, largeArcFlag, sweepFlag, end1[0], -end1[1]];
            var arc2 = ["M", end1[0], -end1[1], "A", r0, r0, 0, largeArcFlag, sweepFlag, end2[0], -end2[1]];
            var arc3 = ["M", end2[0], -end2[1], "A", r2, r2, 0, largeArcFlag, 1, start2[0], -start2[1]];
            var arc4 = ["M", start2[0], -start2[1], "A", r0, r0, 0, largeArcFlag, sweepFlag, start1[0], -start1[1]];
            var d = [arc1.join(" "), arc2.join(" "), arc3.join(" "), arc4.join(" "), "z"].join("");

            return d;
        }

        // if (Prim.Layer == pcb.layers.KEEP_OUT_LAYER) {
        //     var res2 = {};
        //     res2["type"] = "arc";
        //     res2["svgpath"] = arc2outline(Normalize(Prim.XCenter), Normalize(Prim.YCenter), Normalize(Prim.Radius), Prim.StartAngle, Prim.EndAngle);
        //     res2["layer"] = Prim.Layer;
        // }
        // if (Prim.InPolygon) {
        //     var res2 = {};
        //     res2["type"] = "polygon";
        //     // res2["type"] = "arc";
        //     // res2["width"] = res["width"];
        //     res2["svgpath"] = arc2outline(Normalize(Prim.XCenter), Normalize(Prim.YCenter), Normalize(Prim.Radius), Prim.StartAngle, Prim.EndAngle, res["width"]);
        //     res2["layer"] = Prim.Layer;
        //     return res2;
        // }

        return res;
    }

    // 90% done
    function parsePad(Prim) {
        var pads = [];
        var res = {};
        var layers = [];

        if (Prim.Layer == eTopLayer) {
            layers.push("F");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.TopXSize), Normalize(Prim.TopYSize)];
        }
        else if (Prim.Layer == eBottomLayer) {
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.BotXSize), Normalize(Prim.BotYSize)];
        }
        else {
            layers.splice(0, 0, "F", "B");
            res["type"] = "th";
            res["size"] = [Normalize(Prim.TopXSize), Normalize(Prim.TopYSize)];  
        }

        res["layers"] = layers;
        res["pos"] = [Normalize(Prim.x), -Normalize(Prim.y)]; 
        res["angle"] = -RoundNum(Prim.Rotation);
        
        // not done 
        if (res["type"] == "th") {
            switch (Prim.TopShape) {
                case 1:  //  Round in AD
                    res["shape"] = (res["size"][0] == res["size"][1]) ? "circle" : "oval";  // done
                    break;
                case 2:  //  Rectangular in AD
                    res["shape"] = "rect";  // done
                    break;
                case 3:  // Octagonal in AD
                    res["shape"] = "chamfrect";  // not done,  it is circle for now  
                    break;
                case 9:  // Rounded Rectangle in AD
                    res["shape"] = "roundrect";  // 
                    break;
                default:
                    res["shape"] = "custom";  // not done, is it necessary?
            }

            switch (Prim.BotShape) {
                case 1: 
                    res["shape"] = (res["size"][0] == res["size"][1]) ? "circle" : "oval"; 
                    break;
                case 2:
                    res["shape"] = "rect";
                    break;
                case 3:
                    res["shape"] = "chamfrect"; 
                    break;
                case 9:
                    res["shape"] = "roundrect";
                    break;
                default:
                    res["shape"] = "custom";
            }    
        } 
        else {
            switch (Prim.ShapeOnLayer(Prim.Layer)) {
                case 1: 
                    res["shape"] = (res["size"][0] == res["size"][1]) ? "circle" : "oval"; 
                    break;
                case 2:
                    res["shape"] = "rect";
                    break;
                case 3:
                    res["shape"] = "chamfrect";  
                    break;
                case 9:
                    res["shape"] = "roundrect";
                    break;
                default:
                    res["shape"] = "custom";
            }           
        }   

        if (res["shape"] == "chamfrect") {  // not done
            res["radius"] = Math.min(res["size"][0], res["size"][1]) * 0.5;
            res["chamfpos"] = res["pos"];
            res["chamfratio"] = 0.5;  

        } else if (res["shape"] == "roundrect") {
            res["radius"] = Math.min(res["size"][0], res["size"][1]) * 0.2; // CornerRatio in AD, how to get it? set 0.25 for now, not done.
        }

        if ("A1".indexOf(Prim.Name) != -1) {
            res["pin1"] = 1;
        }

        if (res["type"] == "th") {
            switch (Prim.HoleType) {
                case 0: // circle
                    res["drillsize"] = [Normalize(Prim.HoleSize), Normalize(Prim.HoleSize)];
                    res["drillshape"] = "circle";
                    break;
                case 1: // square, but not supported in kicad, so do as circle
                    res["drillsize"] = [Normalize(Prim.HoleSize), Normalize(Prim.HoleSize)];
                    res["drillshape"] = "circle";
                    break;
                case 2: // slot
                    res["drillsize"] = [Normalize(Prim.HoleWidth), Normalize(Prim.HoleSize)];
                    res["drillshape"] = "oblong"; 
                    break;
                default:  //
            }
        }

        res["offset"] =  [Normalize(Prim.XPadOffset(Prim.Layer)), -Normalize(Prim.YPadOffset(Prim.Layer))];
        if (res["offset"][0] == 0 && res["offset"][1] == 0) {
            delete res["offset"];
        }

        pads.push(res);

        return pads;
    }

    // 75% done
    function parseVia(Prim) {
        var vias = [];
        var res = {};
        var layers = [];

        var viaLayer; 
        if (Prim.StartLayer.LayerID == eTopLayer && Prim.StopLayer.LayerID != eBottomLayer) {
            viaLayer = eTopLayer;
            layers.push("F");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.StackSizeOnLayer(eTopLayer)), Normalize(Prim.StackSizeOnLayer(eTopLayer))];
        } 
        else if (Prim.StartLayer.LayerID != eBottomLayer && Prim.StopLayer.LayerID == eTopLayer) {
            viaLayer = eTopLayer;
            layers.push("F");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.StackSizeOnLayer(eTopLayer)), Normalize(Prim.StackSizeOnLayer(eTopLayer))];
        } 
        else if (Prim.StartLayer.LayerID == eTopLayer && Prim.StopLayer.LayerID == eTopLayer) {
            viaLayer = eTopLayer;
            layers.push("F");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.StackSizeOnLayer(eTopLayer)), Normalize(Prim.StackSizeOnLayer(eTopLayer))];
        } 
        else if (Prim.StartLayer.LayerID == eBottomLayer && Prim.StopLayer.LayerID != eTopLayer) {
            viaLayer = eBottomLayer;
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.StackSizeOnLayer(eBottomLayer)), Normalize(Prim.StackSizeOnLayer(eBottomLayer))];
        } 
        else if (Prim.StartLayer.LayerID != eTopLayer && Prim.StopLayer.LayerID == eBottomLayer) {
            viaLayer = eBottomLayer;
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.StackSizeOnLayer(eBottomLayer)), Normalize(Prim.StackSizeOnLayer(eBottomLayer))];
        } 
        else if (Prim.StartLayer.LayerID == eBottomLayer && Prim.StopLayer.LayerID == eBottomLayer) {
            viaLayer = eBottomLayer;
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [Normalize(Prim.StackSizeOnLayer(eBottomLayer)), Normalize(Prim.StackSizeOnLayer(eBottomLayer))];
        } 
        else if (Prim.StartLayer.LayerID == eTopLayer && Prim.StopLayer.LayerID == eBottomLayer) {
            viaLayer = eMultiLayer;
            layers.splice(0, 0, "F", "B");
            res["type"] = "th";
            res["size"] = [Normalize(Prim.Size), Normalize(Prim.Size)];  
        } 
        else if (Prim.StartLayer.LayerID == eBottomLayer && Prim.StopLayer.LayerID == eTopLayer) {
            viaLayer = eMultiLayer;
            layers.splice(0, 0, "F", "B");
            res["type"] = "th";
            res["size"] = [Normalize(Prim.Size), Normalize(Prim.Size)];  
        } else {
            viaLayer = "inner";
        }

        res["layers"] = layers;
        res["pos"] = [Normalize(Prim.x), -Normalize(Prim.y)]; 
        res["angle"] = -RoundNum(Prim.Rotation);
        
        res["shape"] = "circle";

        if (res["type"] == "th") {
            res["drillsize"] = [Normalize(Prim.HoleSize), Normalize(Prim.HoleSize)];
            res["drillshape"] = "circle";
        }

        vias.push(res);

        return vias;
    }


    function rotatePoint(tPoint, aPoint, angle) {
        var rad = angle * Math.PI / 180;
        var newPoint = [
            (tPoint[0] - aPoint[0]) * Math.cos(rad) - (tPoint[1] - aPoint[1]) * Math.sin(rad) + aPoint[0], 
            (tPoint[0] - aPoint[0]) * Math.sin(rad) + (tPoint[1] - aPoint[1]) * Math.cos(rad) + aPoint[1]
        ];
        var res = [RoundNum(newPoint[0]), -RoundNum(newPoint[1])]; // coordinate system transformed from AD to KiCad

        return res;
    }

    // 99% done
    function parseFill(Prim) {
        var res = {};
        var angle = RoundNum(Prim.Rotation);
        var corner1 = [Normalize(Prim.X1Location), Normalize(Prim.Y1Location)];
        var corner3 = [Normalize(Prim.X2Location), Normalize(Prim.Y2Location)];
        var width = corner3[0] - corner1[0];
        var height = corner3[1] - corner1[1];
        var pos = [corner1[0] + width / 2, corner1[1] + height / 2];
        var corner2 = [corner1[0], corner3[1]];
        var corner4 = [corner3[0], corner1[1]];
        var tcorner1 = rotatePoint(corner1, pos, angle);
        var tcorner2 = rotatePoint(corner2, pos, angle);
        var tcorner3 = rotatePoint(corner3, pos, angle);
        var tcorner4 = rotatePoint(corner4, pos, angle);

        res["svgpath"] =  ["M", tcorner1.join(" "), "L", tcorner2.join(" "), "L", tcorner3.join(" "), "L", tcorner4.join(" "), "Z"].join("");
        res["type"] = "polygon";
        // res["type"] = "segment";
        res["layer"] = Prim.Layer;
       
        // res.net = "";
        // if (!Prim.IsFreePrimitive) {
        //     res['free'] = false;
        // }
        return res;
    }

    // 50% done
    function parseRegion(Prim) {
        var res = {};
        var polygons = [];
        var regionholes = [];
        var count = Prim.MainContour.Count;

        if (Prim.Kind == 0 && !Prim.IsKeepout) {
            for (var i = 1; i <= count; i++) {
                polygons.push([Normalize(Prim.MainContour.x(i)), Normalize(-Prim.MainContour.y(i))].join(" "));
            }         
        } else {
            return res;
        }

        // ?
        // count = Prim.HoleCount;
        // for (var k = 0; k < count; k++) {
        //     for (var i = 1; i <= Prim.Holes[k].Count; i++) {
        //         regionholes.push([Normalize(Prim.Holes[k].x(i)), Normalize(-Prim.Holes[k].y(i))]);
        //     }
        // }
        // 
        res["type"] = "polygon";
        res["svgpath"] = ["M", polygons.shift(), "L", polygons.join("L"), "Z"].join(""); 
        res["layer"] = Prim.Layer;
        // res["regionholes"] = regionholes; // extra
        // res.net = "";
        return res;
    }

    // 20% done
    function parsePoly(Polygon) {
        // var res = {};
        // var polygons = [];
        // var tracks = [];
        // var arcs = [];
        // var regions = [];

        var drawings = [];
        // var count = Polygon.PointCount; 
        // for (var i = 0; i <= count; i++) {
        //     if (Polygon.Segments(i).Kind == ePolySegmentArc) {
        //         polygons.push({"x": Normalize(Polygon.Segments(i).cx), "y": Normalize(-Polygon.Segments(i).cy)});
        //     }
        //     else {
        //         polygons.push({"x": Normalize(Polygon.Segments(i).vx), "y": Normalize(-Polygon.Segments(i).vy)});
        //     }           
        // }   
        // res["svgpath"] = toPath(polygons);
        // res["type"] = "polygon";
        // res["layer"] = Prim.Layer;   

        var Iter = Polygon.GroupIterator_Create;
        var Prim = Iter.FirstPCBObject;
        while (Prim != null) {
            switch (Prim.ObjectId) {
                case eArcObject:
                    drawings.push(parseArc(Prim));
                    break;
                case eTrackObject:
                    drawings.push(parseTrack(Prim));
                    break;
                case eRegionObject:
                    drawings.push(parseRegion(Prim));
                    break;
            }
            Prim = Iter.NextPCBObject;
        }

        return drawings;
    }

    // 95% done
    function parseEdges(pcb) {
        var edges = [];
        var default_width = Normalize(MilsToCoord(5));
        var bbox = {};
        bbox["minx"] = Normalize(pcb.board.BoardOutline.BoundingRectangle.Left);
        bbox["miny"] = -Normalize(pcb.board.BoardOutline.BoundingRectangle.Top);
        bbox["maxx"] = Normalize(pcb.board.BoardOutline.BoundingRectangle.Right);
        bbox["maxy"] = -Normalize(pcb.board.BoardOutline.BoundingRectangle.Bottom);
    
        // boardoutline edges 
        // var k;
        // var count = pcb.board.BoardOutline.PointCount
        // for (var i = 0; i < count; i++) {
        //     k = i + 1;
        //     edges.push({});
        //     if (pcb.board.BoardOutline.Segments(i).Kind == ePolySegmentLine) {
        //         if (k == pcb.board.BoardOutline.PointCount) {
        //             k = 0;
        //         }
        //         edges[i]["start"] = [Normalize(pcb.board.BoardOutline.Segments(i).vx), -Normalize(pcb.board.BoardOutline.Segments(i).vy)];
        //         edges[i]["end"] = [Normalize(pcb.board.BoardOutline.Segments(k).vx), -Normalize(pcb.board.BoardOutline.Segments(k).vy)];
        //         edges[i]["type"] = "segment";
        //         edges[i]["width"] = default_width;
        //         edges[i]["layer"] = pcb.Layers.OUTLINE_LAYER;
        //     }
        //     else {
        //         edges[i]["start"] = [Normalize(pcb.board.BoardOutline.Segments(i).cx), -Normalize(pcb.board.BoardOutline.Segments(i).cy)];
        //         edges[i]["startangle"] = -pcb.board.BoardOutline.Segments(i).Angle2;
        //         edges[i]["endangle"] = -pcb.board.BoardOutline.Segments(i).Angle1;
        //         edges[i]["type"] = "arc";
        //         edges[i]["radius"] = Normalize(pcb.board.BoardOutline.Segments(i).Radius);
        //         edges[i]["width"] = default_width;
        //         edges[i]["layer"] = pcb.Layers.OUTLINE_LAYER;
        //     }
        // }

        var Iter, Prim;
        Iter = pcb.board.BoardIterator_Create;
        Iter.AddFilter_ObjectSet(MkSet(eArcObject, eTrackObject));
        Iter.AddFilter_LayerSet(MkSet(pcb.Layers.KEEP_OUT_LAYER));
        Iter.AddFilter_Method(eProcessAll);
        Prim = Iter.FirstPCBObject;
        while (Prim != null) {
            switch (Prim.ObjectId) {
                case eArcObject:
                    edges.push(parseArc(Prim));
                    break;
                case eTrackObject:
                    edges.push(parseTrack(Prim));
                    break;
            }
            Prim = Iter.NextPCBObject;
        }
        pcb.board.BoardIterator_Destroy(Iter);

        pcb.pcbdata["edges"] = edges;
        pcb.pcbdata["edges_bbox"] = bbox;
    }

    function getMetadata(pcb) {
        var res = {};
        res["title"] = ChangeFileExt(pcb.boardname, "");
        res["revision"] = "";
        res["company"] = "";

        var fso = new ActiveXObject("Scripting.FileSystemObject"); 
        var boardfile = fso.GetFile(pcb.board.FileName);
        var d = new Date(boardfile.DateLastModified);
        
        res["date"] = [d.getFullYear() , d.getMonth() + 1, d.getDate()].join("-") + " " + [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
        return res;
    }

    // 90% done  // only support default Stroke font for now
    function parseText(Prim) {
        var res = {};
        if (Prim.IsHidden) {
            return res;
        }
        else if (Prim.TextKind == eText_BarCode) {
            return res;  //  an API in AD called ConvetToStrokeArray seems not implemented 
        }

        res["attr"] = [];
        if (Prim.MirrorFlag) {
            res.attr.push("mirrored");
        }
        if (Prim.Italic) {
            res.attr.push("italic");
        }
        if (Prim.Bold) {
            res.attr.push("bold");
        }
        if (Prim.Inverted) {
            res.attr.push("inverted");
        }
        res["type"] = "text";
        res["text"] = Prim.Text;
        res["angle"] = RoundNum(Prim.Rotation);
        res["layer"] = Prim.Layer;

        var xa, ya;
        xa = Prim.BoundingRectangle.Left + (Prim.BoundingRectangle.Right - Prim.BoundingRectangle.Left) / 2;
        ya = Prim.BoundingRectangle.Bottom + (Prim.BoundingRectangle.Top - Prim.BoundingRectangle.Bottom) / 2;
        xa = Normalize(xa);
        ya = Normalize(ya);
        res["pos"] = [xa, -ya];
        res["thickness"] = Normalize(Prim.Width);
        res["height"] = Normalize(Prim.Size);
        res["width"] = RoundNum(res["height"] * 1.1); // single char's width in kicad
        // res["horiz_justify"] = 0; // center align, tag 2.3
        res["justify"] = [0, 0];  //

        if (Prim.IsDesignator) {
            res["ref"] = 1;
        }
        if (Prim.IsComment) {
            res["val"] = 1;
        }

        return res;
    }


    // 91% done
    function parseComponent(Component) {
        var res = {};
        var oFootprint = {};
        var oComponent = {};
        var pads = [];
        var bbox = {};

        var Iter, Prim;
        var isSMD = true;
        Iter = Component.GroupIterator_Create;
        Iter.AddFilter_ObjectSet(MkSet(ePadObject));
        // Iter.AddFilter_LayerSet(AllLayers);
        // Iter.AddFilter_Method(eProcessAll);
        Prim = Iter.FirstPCBObject;
        while (Prim != null) {
            pads = pads.concat(parsePad(Prim));
            if (isSMD && Prim.Layer == eMultiLayer) {
                isSMD = false;
            }
            Prim = Iter.NextPCBObject;
        }
        Component.GroupIterator_Destroy(Iter);

        oFootprint["drawings"] = [];
        Iter = Component.GroupIterator_Create;
        Iter.AddFilter_ObjectSet(MkSet(eTrackObject, eArcObject, eFillobject, eRegionObject));
        Iter.AddFilter_LayerSet(MkSet(eTopLayer, eBottomLayer));
        // Iter.AddFilter_Method(eProcessAll);
        Prim = Iter.FirstPCBObject;
        while (Prim != null) {
            if (Prim.Layer == eTopLayer) {
                switch (Prim.ObjectId) {
                    case eTrackObject:
                        oFootprint["drawings"].push({"layer": "F", "drawing": parseTrack(Prim)});
                        break;
                    case eArcObject:
                        oFootprint["drawings"].push({"layer": "F", "drawing": parseArc(Prim)});
                        break;
                    case eFillobject:
                        oFootprint["drawings"].push({"layer": "F", "drawing": parseFill(Prim)});
                        break;
                    case eRegionObject:
                        oFootprint["drawings"].push({"layer": "F", "drawing": parseRegion(Prim)});
                        break;
                    default:
                }
            } 
            else if (Prim.Layer == eBottomLayer) {
                switch (Prim.ObjectId) {
                    case eTrackObject:
                        oFootprint["drawings"].push({"layer": "B", "drawing": parseTrack(Prim)});
                        break;
                    case eArcObject:
                        oFootprint["drawings"].push({"layer": "B", "drawing": parseArc(Prim)});
                        break;
                    case eFillobject:
                        oFootprint["drawings"].push({"layer": "B", "drawing": parseFill(Prim)});
                        break;
                    case eRegionObject:
                        oFootprint["drawings"].push({"layer": "B", "drawing": parseRegion(Prim)});
                        break;
                    default:
                }
            }
            Prim = Iter.NextPCBObject;
        }
        Component.GroupIterator_Destroy(Iter);

        var x0, y0, x1, y1, xa, ya, Dx, Dy;
        x0 = Component.BoundingRectangleNoNameCommentForSignals.Left;
        y0 = Component.BoundingRectangleNoNameCommentForSignals.Bottom;
        x1 = Component.BoundingRectangleNoNameCommentForSignals.Right;
        y1 = Component.BoundingRectangleNoNameCommentForSignals.Top;
        Dx = x1 - x0;
        Dy = y1 - y0;
        xa = Normalize(x0 + Dx / 2);
        ya = Normalize(y0 + Dy / 2);
        bbox["pos"] = [Normalize(x0), -Normalize(y1)];
        bbox["relpos"] = [0, 0];
        bbox["angle"] = 0;
        bbox["size"] = [Normalize(Dx), Normalize(Dy)];

        oFootprint["bbox"] = bbox;
        oFootprint["center"] = [xa, -ya];
        oFootprint["pads"] = pads;
        oFootprint["ref"] = Component.Name.Text;
        if (Component.Layer == eTopLayer) {
            oFootprint["layer"] = "F";
        }
        else {
            oFootprint["layer"] = "B";
        }

        oComponent["ref"] = oFootprint.ref;
        oComponent["val"] = Component.Comment.Text;
        oComponent["footprint"] = Component.Pattern;
        oComponent["layer"] = oFootprint["layer"];
        oComponent["attr"] = null;

        res["angle"] = RoundNum(Component.Rotation);
        res["itemkey"] = ["k", oComponent["ref"].slice(0, 1), oComponent["footprint"], oComponent["val"]].join("");
        if (isSMD) {
            res["soldertype"] = "smd";
        }
        else {
            res["soldertype"] = "th";
        }
        res["footprint"] = oFootprint;
        res["component"] = oComponent;

        return res;
    }

    //======
    function parseDrawingsOnLayers(drawings, f_layer, b_layer) {
        var front = [];
        var back = [];
        for (var i = drawings.length - 1; i >= 0; i--) {
            if (drawings[i].layer == f_layer) {
                front.push(drawings[i]);
            }
            else if (drawings[i].layer == b_layer) {
                back.push(drawings[i]);
            }
        }
        return {"F": front, "B": back};
    }

    // parse_board
    PCBServer.PreProcess;
    var board = PCBServer.GetCurrentPCBBoard();
    if (board == null) {
        showmessage("ERROR:Current document is not a PCB document");
        return false;
    }
    pcb["board"] = board;
    pcb["boardpath"] = ExtractFilePath(board.FileName);
    pcb["boardname"] = ExtractFileName(board.FileName);

    pcb.pcbdata["metadata"] = getMetadata(pcb);

    parseEdges(pcb);

    pcb.pos.push(Normalize(board.XOrigin));
    pcb.pos.push(Normalize(board.YOrigin));

    var Iter, Prim; 
    Iter = pcb.board.BoardIterator_Create;
    // Iter.AddFilter_ObjectSet(MkSet(eTrackObject, eArcObject, ePadObject, eViaObject, eFillobject, eRegionObject, eTextObject, eComponentObject, ePolyObject));
    Iter.AddFilter_ObjectSet(MkSet(eComponentObject));
    Iter.AddFilter_LayerSet(AllLayers);
    Iter.AddFilter_Method(eProcessAll);
    Prim = Iter.FirstPCBObject;
    while (Prim != null) {
        pcb.modules.push(parseComponent(Prim));
        Prim = Iter.NextPCBObject;
    }
    pcb.board.BoardIterator_Destroy(Iter);

    // parse freepads , all free pads mounted to a footprintNoBom to be rendered
    var footprintNoBom = {};
    footprintNoBom["bbox"] = {"pos": [0, 0], "relpos": [0, 0], "size": [0, 0], "angle": 0};
    footprintNoBom["center"] = [0, 0];
    footprintNoBom["ref"] = "";
    footprintNoBom["layer"] = "F";
    footprintNoBom["drawings"] = [];
    footprintNoBom["pads"] = [];

    Iter = pcb.board.BoardIterator_Create; 
    Iter.AddFilter_ObjectSet(MkSet(ePadObject, eViaObject));
    Iter.AddFilter_LayerSet(AllLayers);
    Iter.AddFilter_Method(eProcessAll);
    Prim = Iter.FirstPCBObject;
    while (Prim != null) {
        if (Prim.IsFreePrimitive) {
            switch (Prim.ObjectId) {
                case ePadObject:
                    footprintNoBom.pads = footprintNoBom.pads.concat(parsePad(Prim));
                    break;
                case eViaObject:
                    // footprintNoBom.pads = footprintNoBom.pads.concat(parseVia(Prim));
                    break;
                default:
            }
        }
        Prim = Iter.NextPCBObject;
    }
    pcb.board.BoardIterator_Destroy(Iter);
    pcb.modules = sortModules(pcb.modules);
    var kk = pcb.modules.length;
    pcb.pcbdata["footprints"] = [];
    for (var n = 0; n < kk; n++) {
        pcb.pcbdata["footprints"].push(pcb.modules[n].footprint);
    }
    pcb.pcbdata.footprints.push(footprintNoBom);

    // parse_drawings
    var drawings = [];
    Iter = pcb.board.BoardIterator_Create;
    Iter.AddFilter_ObjectSet(MkSet(eTextObject, eTrackObject, eArcObject, eFillobject, eRegionObject));
    Iter.AddFilter_LayerSet(MkSet(pcb.Layers.TOP_OVERLAY_LAYER, pcb.Layers.BOT_OVERLAY_LAYER));
    Iter.AddFilter_Method(eProcessAll);
    Prim = Iter.FirstPCBObject;
    while (Prim != null) {
        if (!Prim.IsFreePrimitive && !Prim.InComponent) {
            Prim = Iter.NextPCBObject;
            continue;   // polygons in AD has "Fill Mode" of "Hatched(Tracks/Arcs)", skip them
        }

        switch (Prim.ObjectId) {
            case eTextObject:
                pcb.texts.push(parseText(Prim));
                break;
            case eTrackObject:
                pcb.tracks.push(parseTrack(Prim));
                break;
            case eArcObject:
                pcb.arcs.push(parseArc(Prim));
                break;
            case eFillobject:
                pcb.fills.push(parseFill(Prim));
                break;
            case eRegionObject:
                pcb.regions.push(parseRegion(Prim));
                break;                  
            default:
        }
        Prim = Iter.NextPCBObject;
    }
    pcb.board.BoardIterator_Destroy(Iter);

    drawings = drawings.concat(pcb.texts, pcb.tracks, pcb.arcs, pcb.fills, pcb.regions);
    pcb.pcbdata["silkscreen"] = parseDrawingsOnLayers(drawings, pcb.Layers.TOP_OVERLAY_LAYER, pcb.Layers.BOT_OVERLAY_LAYER);
    pcb.pcbdata["fabrication"] = parseDrawingsOnLayers(drawings, pcb.Layers.TOP_DIMENSIONS_LAYER, pcb.Layers.BOT_DIMENSIONS_LAYER);
    
    // rough handling tracks and zones, not done
    // Iter = pcb.board.BoardIterator_Create;
    // Iter.AddFilter_ObjectSet(MkSet(eTrackObject, eArcObject, eRegionObject, eFillobject));
    // Iter.AddFilter_LayerSet(MkSet(eTopLayer, eBottomLayer));
    // Iter.AddFilter_Method(eProcessAll);
    // var draws = {};
    // draws["tracks"] = [];
    // draws["polygons"] = [];
    // draws["arcs"] = [];
    // Prim = Iter.FirstPCBObject;
    // while (Prim != null) {
    //     if (Prim.InComponent || Prim.InPolygon) {
    //         Prim = Iter.NextPCBObject;
    //         continue; 
    //     }

    //     switch (Prim.ObjectId) {
    //         case eTrackObject:
    //             draws.tracks.push(parseTrack(Prim));
    //             break;
    //         case eArcObject:
    //             draws.arcs.push(parseArc(Prim));
    //             break;
    //         case eFillobject:
    //             draws.polygons.push(parseFill(Prim));
    //             break;
    //         case eRegionObject:
    //             draws.polygons.push(parseRegion(Prim));
    //             break;                  
    //         default:
    //     }    
    //     Prim = Iter.NextPCBObject;
    // }
    // pcb.board.BoardIterator_Destroy(Iter);

    // pcb.pcbdata["tracks"] = parseDrawingsOnLayers(draws.tracks, eTopLayer, eBottomLayer);  
    // pcb.pcbdata["zones"] = parseDrawingsOnLayers(draws.polygons, eTopLayer, eBottomLayer);

    function parseFontStr(s) {
        pcb.pcbdata["font_data"] = {};
        var STROKE_FONT_SCALE = 1 / 21;
        var FONT_OFFSET = -10;
        var NEWSTROKE_FONT = get_newstroke_font();
        function parseFontChar(c) {
            var lines = [];
            var glyph_x = 0;
            var glyph_width;
            var line = [];
            var index = c.charCodeAt(0) - " ".charCodeAt(0);
            if (index >= NEWSTROKE_FONT.length) {
                index = "?".charCodeAt(0) - " ".charCodeAt(0);
            }

            var glyph_str = NEWSTROKE_FONT[index];
            var coord;
            var len = glyph_str.length;
            for (var i = 0; i < len; i += 2) {
                coord = glyph_str.slice(i, i + 2);
                if (i < 2) {
                    glyph_x = (coord.charCodeAt(0) - "R".charCodeAt(0)) * STROKE_FONT_SCALE;
                    glyph_width = (coord.charCodeAt(1) - coord.charCodeAt(0)) * STROKE_FONT_SCALE;
                } else if (coord.slice(0, 1) == " " && coord.slice(1, 2) == "R") {
                    lines.push(line);
                    line = [];
                }
                else {
                    line.push([
                        RoundNum((coord.charCodeAt(0) - "R".charCodeAt(0)) * STROKE_FONT_SCALE - glyph_x),
                        RoundNum((coord.charCodeAt(1) - "R".charCodeAt(0) + FONT_OFFSET) * STROKE_FONT_SCALE)
                        ])
                }
            }

            if (line.length > 0) {
                lines.push(line);
            }
            return {
                "w": RoundNum(glyph_width),
                "l": lines
            }
        }

        var chrArr = s.split("");
        for (var i = chrArr.length - 1; i >= 0; i--) {
            if (chrArr[i] == "\t" && !pcb.pcbdata.font_data.hasOwnProperty(chrArr[i])) {
                pcb.pcbdata.font_data[" "] = parseFontChar(" ");
            } 
            
            if (!pcb.pcbdata.font_data.hasOwnProperty(chrArr[i]) && chrArr[i].charCodeAt(0) >= " ".charCodeAt(0)) {
                pcb.pcbdata.font_data[chrArr[i]] = parseFontChar(chrArr[i]);
            } 
        }
    }

    var str_text = [];
    for (var i = pcb.texts.length - 1; i >= 0; i--) {
        str_text.push(pcb.texts[i].text);
    }
    parseFontStr(str_text.join(""));

    PCBServer.PostProcess;

    return pcb;
} 
// var t0 = new Date().getTime();
var pcb = parsePcb();



