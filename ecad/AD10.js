
/// AD10.js
/// 
// function Normalize(coord) {
//     return Math.round(0.0254 * coord / 100) / 100;
// }

// function RoundNum(num) {
//     return Math.round(num * 100) / 100;
// }

Number.prototype.round = function anonymFun_round(n) {
    var n = n || 2;
    if (n == 2 || n < 0) {
        return Math.round(this * 100) / 100;
    }
    var d = Math.pow(10, n);
    return Math.round(this * d) / d;
};


function rotatePoint(cPoint, rPoint, angle) {
    var rad = Degrees2Radians(angle);
    return [
        ((rPoint[0] - cPoint[0]) * Math.cos(rad) - (rPoint[1] - cPoint[1]) * Math.sin(rad) + cPoint[0]).round(), 
        -((rPoint[0] - cPoint[0]) * Math.sin(rad) + (rPoint[1] - cPoint[1]) * Math.cos(rad) + cPoint[1]).round()
    ];
}


function get_bbox(Prim) {

    function get_component_bbox(Component) {
        var bbox = {};
        var x0, y0, x1, y1;
        x0 = CoordToMMs(Component.BoundingRectangleNoNameCommentForSignals.Left);
        y0 = CoordToMMs(Component.BoundingRectangleNoNameCommentForSignals.Bottom);
        x1 = CoordToMMs(Component.BoundingRectangleNoNameCommentForSignals.Right);
        y1 = CoordToMMs(Component.BoundingRectangleNoNameCommentForSignals.Top);
        bbox["pos"] = [x0.round(), -y1.round()]; // 
        bbox["relpos"] = [0, 0];
        bbox["angle"] = 0;
        bbox["size"] = [(x1 - x0).round(), (y1 - y0).round()];
        bbox["center"] = [(x0 + bbox.size[0] / 2).round(), -(y0 + bbox.size[1] / 2).round()];
        return bbox;
    }

    function get_text_bbox(Text) {
        var bbox = {};
        var x0, y0, x1, y1;
        x0 = CoordToMMs(Text.BoundingRectangleForSelection.Left);
        y0 = CoordToMMs(Text.BoundingRectangleForSelection.Bottom);
        x1 = CoordToMMs(Text.BoundingRectangleForSelection.Right);
        y1 = CoordToMMs(Text.BoundingRectangleForSelection.Top);
        
        // bbox["pos"] = [x0, -y1];
        // bbox["relpos"] = [0, 0];
        // bbox["angle"] = 0;
        bbox["size"] = [(x1 - x0).round(), (y1 - y0).round()];

        bbox["center"] = [(x0 + bbox.size[0] / 2).round(), -(y0 + bbox.size[1] / 2).round()];

        return bbox;
    }

    switch (Prim.ObjectId) {
        case eComponentObject:
            return get_component_bbox(Prim);
            break;
        case eTextObject:
            return get_text_bbox(Prim);
            break;

        default:
    }
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

    function parseTrack(Prim) {
        var res = {};
        var start = [CoordToMMs(Prim.x1).round(), -CoordToMMs(Prim.y1).round()];
        var end = [CoordToMMs(Prim.x2).round(), -CoordToMMs(Prim.y2).round()];
        res["layer"] = Prim.Layer;
        if (Prim.InPolygon) {
            res["type"] = "polygon";
            res["svgpath"] = ["M", start, "L", end].join(" ");
        } else {
            res["type"] = "segment";
            res["start"] = start;
            res["end"] = end;
            res["width"] = CoordToMMs(Prim.Width).round();
        } 

        if (Prim.InNet) {
            // res["net"] = Prim.Net.Name;
        };

        return res;
    }

    function parseArc(Prim) {
        var res = {};
        var width = CoordToMMs(Prim.LineWidth).round();
        function arc2path(cx, cy, radius, startangle, endangle) {
            var startrad = Degrees2Radians(startangle);
            var endrad = Degrees2Radians(endangle);
            var start = [cx + (radius * Math.cos(startrad)), cy + (radius * Math.sin(startrad))];
            var end = [cx + (radius * Math.cos(endrad)), cy + (radius * Math.sin(endrad))];

            if (start[0] == end[0] && start[1] == end[1]) {
                var d = ["M", cx - radius, -cy, "a", radius, radius, 0, 1, 0, 2*radius, 0, "a", radius, radius, 0, 1, 0, -2*radius, 0].join(" ");
                return d;
            }

            var da = startangle > endangle ? endangle - startangle + 360 : endangle - startangle;
            var largeArcFlag = da <= 180 ? "0" : "1";
            var sweepFlag = 0;
            var d = ["M", start[0].round(), -start[1].round(), "A", radius, radius, 0, largeArcFlag, sweepFlag, end[0].round(), -end[1].round()].join(" ");

            return d;            
        }

        function arc2tracks(cx, cy, radius, startangle, endangle) {
            var da = startangle > endangle ? endangle - startangle + 360 : endangle - startangle;
            var n;
            if (da <= 90 && da >= 0) {
                n = 4;
            } else if (da <= 180 && da > 90) {
                n = 8;
            } else if (da <= 270 && da > 180) {
                n = 16;
            } else if (da <= 360 && da > 270) {
                n = 32;
            }

            var o = [cx + radius, cy];
            // var start = rotatePoint([cx, cy], o, startangle);

            var points = [];
            var step = da / n;
            for (var i = 0; i <= n; i++) {
                points.push(rotatePoint([cx, cy], o, startangle + i * step));
            }

            var tracks = [];
            var len = points.length - 1;
            if (Prim.InPolygon) {
                for (var i = 0; i < len; i++) {
                    tracks.push({
                        "type": "polygon",
                        // "svgpath": ["M", points[i+0][0], -points[i+0][1], points[i+1][0], -points[i+1][1]].join(" "),
                        "svgpath": ["M", points[i+0], points[i+1]].join(" "),
                        "layer": Prim.Layer
                    })
                }   
            } else {
                for (var i = 0; i < len; i++) {
                    tracks.push({
                        "type": "segment",
                        // "start": [points[i+0][0], -points[i+0][1]],
                        // "end": [points[i+1][0], -points[i+1][1]],
                        "start": points[i+0],
                        "end": points[i+1],
                        "layer": Prim.Layer,
                        "width": width
                    })
                }     
            }

            return tracks;
        }

        // if (Prim.IsFreePrimitive && (Prim.Layer == eTopLayer || Prim.Layer == eBottomLayer)) {
        if (Prim.Layer == eTopLayer || Prim.Layer == eBottomLayer) {
            return arc2tracks(CoordToMMs(Prim.XCenter), CoordToMMs(Prim.YCenter), CoordToMMs(Prim.Radius), Prim.StartAngle, Prim.EndAngle);     
        } else {
            res["type"] = "arc";
            res["width"] = width;
            res["startangle"] = -Prim.EndAngle.round();
            res["endangle"] = -Prim.StartAngle.round();
            res["start"] = [CoordToMMs(Prim.XCenter).round(), -CoordToMMs(Prim.YCenter).round()];
            res["radius"] = CoordToMMs(Prim.Radius).round();
            res["layer"] = Prim.Layer;
            return res;
        }
    }

    // 90% done
    function parsePad(Prim) {
        var pads = [];
        var res = {};
        var layers = [];

        if (Prim.Layer == eTopLayer) {
            layers.push("F");
            res["type"] = "smd";
            res["size"] = [CoordToMMs(Prim.TopXSize).round(), CoordToMMs(Prim.TopYSize).round()];
        }
        else if (Prim.Layer == eBottomLayer) {
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [CoordToMMs(Prim.BotXSize).round(), CoordToMMs(Prim.BotYSize).round()];
        }
        else {
            layers.splice(0, 0, "F", "B");
            res["type"] = "th";
            res["size"] = [CoordToMMs(Prim.TopXSize).round(), CoordToMMs(Prim.TopYSize).round()];  
        }

        res["layers"] = layers;
        res["pos"] = [CoordToMMs(Prim.x).round(), -CoordToMMs(Prim.y).round()]; 
        res["angle"] = -Prim.Rotation.round();
        
        // not done 
        if (Prim.Layer == eMultiLayer) {
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
            res["radius"] = (Math.min(res["size"][0], res["size"][1]) * 0.5).round();
            res["chamfpos"] = res["pos"];
            res["chamfratio"] = 0.5;  

        } else if (res["shape"] == "roundrect") {
            res["radius"] = CoordToMMs(Prim.CornerRadius(Prim.Layer)).round();  //  smd ? th ?
        }

        if ("A1".indexOf(Prim.Name) != -1) {
            res["pin1"] = 1;
        }

        if (res["type"] == "th") {
            switch (Prim.HoleType) {
                case 0: // circle
                    res["drillsize"] = [CoordToMMs(Prim.HoleSize).round(), CoordToMMs(Prim.HoleSize).round()];
                    res["drillshape"] = "circle";
                    break;
                case 1: // square, but not supported in kicad, so do as circle
                    res["drillsize"] = [CoordToMMs(Prim.HoleSize).round(), CoordToMMs(Prim.HoleSize).round()];
                    res["drillshape"] = "circle";
                    break;
                case 2: // slot
                    res["drillsize"] = [CoordToMMs(Prim.HoleWidth).round(), CoordToMMs(Prim.HoleSize).round()];
                    res["drillshape"] = "oblong"; 
                    break;
                default:  //
            }
        }

        res["offset"] =  [CoordToMMs(Prim.XPadOffset(Prim.Layer)).round(), -CoordToMMs(Prim.YPadOffset(Prim.Layer)).round()];
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
            res["size"] = [CoordToMMs(Prim.StackSizeOnLayer(eTopLayer)).round(), CoordToMMs(Prim.StackSizeOnLayer(eTopLayer)).round()];
        } 
        else if (Prim.StartLayer.LayerID != eBottomLayer && Prim.StopLayer.LayerID == eTopLayer) {
            viaLayer = eTopLayer;
            layers.push("F");
            res["type"] = "smd";
            res["size"] = [CoordToMMs(Prim.StackSizeOnLayer(eTopLayer)).round(), CoordToMMs(Prim.StackSizeOnLayer(eTopLayer)).round()];
        } 
        else if (Prim.StartLayer.LayerID == eTopLayer && Prim.StopLayer.LayerID == eTopLayer) {
            viaLayer = eTopLayer;
            layers.push("F");
            res["type"] = "smd";
            res["size"] = [CoordToMMs(Prim.StackSizeOnLayer(eTopLayer)).round(), CoordToMMs(Prim.StackSizeOnLayer(eTopLayer)).round()];
        } 
        else if (Prim.StartLayer.LayerID == eBottomLayer && Prim.StopLayer.LayerID != eTopLayer) {
            viaLayer = eBottomLayer;
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [CoordToMMs(Prim.StackSizeOnLayer(eBottomLayer)).round(), CoordToMMs(Prim.StackSizeOnLayer(eBottomLayer)).round()];
        } 
        else if (Prim.StartLayer.LayerID != eTopLayer && Prim.StopLayer.LayerID == eBottomLayer) {
            viaLayer = eBottomLayer;
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [CoordToMMs(Prim.StackSizeOnLayer(eBottomLayer)).round(), CoordToMMs(Prim.StackSizeOnLayer(eBottomLayer)).round()];
        } 
        else if (Prim.StartLayer.LayerID == eBottomLayer && Prim.StopLayer.LayerID == eBottomLayer) {
            viaLayer = eBottomLayer;
            layers.push("B");
            res["type"] = "smd";
            res["size"] = [CoordToMMs(Prim.StackSizeOnLayer(eBottomLayer)).round(), CoordToMMs(Prim.StackSizeOnLayer(eBottomLayer)).round()];
        } 
        else if (Prim.StartLayer.LayerID == eTopLayer && Prim.StopLayer.LayerID == eBottomLayer) {
            viaLayer = eMultiLayer;
            layers.splice(0, 0, "F", "B");
            res["type"] = "th";
            res["size"] = [CoordToMMs(Prim.Size).round(), CoordToMMs(Prim.Size).round()];  
        } 
        else if (Prim.StartLayer.LayerID == eBottomLayer && Prim.StopLayer.LayerID == eTopLayer) {
            viaLayer = eMultiLayer;
            layers.splice(0, 0, "F", "B");
            res["type"] = "th";
            res["size"] = [CoordToMMs(Prim.Size).round(), CoordToMMs(Prim.Size).round()];  
        } else {
            viaLayer = "inner";
        }

        res["layers"] = layers;
        res["pos"] = [CoordToMMs(Prim.x).round(), -CoordToMMs(Prim.y).round()];
        res["angle"] = 0; 
        
        res["shape"] = "circle";

        if (res["type"] == "th") {
            res["drillsize"] = [CoordToMMs(Prim.HoleSize).round(), CoordToMMs(Prim.HoleSize).round()];
            res["drillshape"] = "circle";
        }

        if (Prim.InNet) {
            // res["net"] = Prim.Net.Name;
        }
        vias.push(res);

        return vias;
    }

    // 99% done
    function parseFill(Prim) {
        var res = {};

        if (Prim.IsKeepout) {
            return res;
        }
        var angle = Prim.Rotation;
        var corner1 = [CoordToMMs(Prim.X1Location), CoordToMMs(Prim.Y1Location)];
        var corner3 = [CoordToMMs(Prim.X2Location), CoordToMMs(Prim.Y2Location)];
        var width = corner3[0] - corner1[0];
        var height = corner3[1] - corner1[1];
        var pos = [corner1[0] + width / 2, corner1[1] + height / 2];
        var corner2 = [corner1[0], corner3[1]];
        var corner4 = [corner3[0], corner1[1]];
        var tcorner1 = rotatePoint(pos, corner1, angle);
        var tcorner2 = rotatePoint(pos, corner2, angle);
        var tcorner3 = rotatePoint(pos, corner3, angle);
        var tcorner4 = rotatePoint(pos, corner4, angle);

        // res["svgpath"] =  ["M", tcorner1[0], -tcorner1[1], "L", tcorner2[0], -tcorner2[1], "L", tcorner3[0], -tcorner3[1], "L", tcorner4[0], -tcorner4[1], "Z"].join(" ");
        res["svgpath"] =  ["M", tcorner1, "L", tcorner2, "L", tcorner3, "L", tcorner4, "Z"].join(" ");
        res["type"] = "polygon";
        res["layer"] = Prim.Layer;
       
       if (Prim.InNet) {
        // res.net = ""; 
       } else {}

        // if (!Prim.IsFreePrimitive) {
        //     res['free'] = false;
        // }
        return res;
    }

    // 55% done
    function parseRegion(Prim) {
        var res = {};
        var polygons = [];
        var count = Prim.MainContour.Count;
        var holes_svg = [];
        if (Prim.Kind == 0 && !Prim.IsKeepout) {    // Kind "Board Cutout" not done (Tracks on KeepOutLayer can do it).
            for (var i = 1; i <= count; i++) {
                polygons.push([CoordToMMs(Prim.MainContour.x(i)).round(), -CoordToMMs(Prim.MainContour.y(i)).round()].join(" "));
            }      
            
            count = Prim.HoleCount;
            for (var k = 0; k < count; k++) {
                var hole = [];
                for (var i = 1; i <= Prim.Holes(k).Count; i++) {
                    hole.push([CoordToMMs(Prim.Holes(k).x(i)).round(), -CoordToMMs(Prim.Holes(k).y(i)).round()].join(" "));
                }
                holes_svg.push(["M", hole.shift(), "L", hole.join("L"), "Z "].join(""));
            }
        } else {
            return res;
        }

        res["type"] = "polygon";
        res["svgpath"] = ["M", polygons.shift(), "L", polygons.join("L"), "Z "].join("") + holes_svg.join(""); 
        res["layer"] = Prim.Layer;
        if (Prim.InNet) {
            // res["net"] = Prim.Net.Name;
        } else {}

        return res;
    }

    // 50% done
    function parsePoly(Polygon) {
        var drawings = [];
        // var count = Polygon.PointCount; 
        // for (var i = 0; i <= count; i++) {
        //     if (Polygon.Segments(i).Kind == ePolySegmentArc) {
        //         polygons.push({"x": CoordToMMs(Polygon.Segments(i).cx), "y": CoordToMMs(-Polygon.Segments(i).cy)});
        //     }
        //     else {
        //         polygons.push({"x": CoordToMMs(Polygon.Segments(i).vx), "y": CoordToMMs(-Polygon.Segments(i).vy)});
        //     }           
        // }   
        var hatched_drawings = [];

        var Iter = Polygon.GroupIterator_Create;
        var Prim = Iter.FirstPCBObject;
        while (Prim != null) {
            switch (Prim.ObjectId) {
                case eArcObject:
                    hatched_drawings = hatched_drawings.concat(parseArc(Prim));
                    break;
                case eTrackObject:
                    hatched_drawings.push(parseTrack(Prim));
                    break;
                case eRegionObject:
                    drawings.push(parseRegion(Prim));
                    break;
            }
            Prim = Iter.NextPCBObject;
        }

        var len = hatched_drawings.length;
        if (len > 1) {
            var hatchedAll2One = {};
            var pathArr = [];
            for (var i = 0; i < len; i++) {
                pathArr.push(hatched_drawings[i].svgpath);
            }
            hatchedAll2One["width"] = CoordToMMs(Polygon.TrackSize).round();
            hatchedAll2One["type"] = "polygon"
            hatchedAll2One["svgpath"] = pathArr.join(" ");
            hatchedAll2One["layer"] = hatched_drawings[0].layer;
            drawings.push(hatchedAll2One);
        }
        return drawings;
    }

    // 95% done
    function parseEdges(pcb) {
        var edges = [];
        var default_width = CoordToMMs(MilsToCoord(5)).round();
        var bbox = {};
        bbox["minx"] = CoordToMMs(pcb.board.BoardOutline.BoundingRectangle.Left).round();
        bbox["miny"] = -CoordToMMs(pcb.board.BoardOutline.BoundingRectangle.Top).round();
        bbox["maxx"] = CoordToMMs(pcb.board.BoardOutline.BoundingRectangle.Right).round();
        bbox["maxy"] = -CoordToMMs(pcb.board.BoardOutline.BoundingRectangle.Bottom).round();
    
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
        //         edges[i]["start"] = [CoordToMMs(pcb.board.BoardOutline.Segments(i).vx).round(), -CoordToMMs(pcb.board.BoardOutline.Segments(i).vy).round()];
        //         edges[i]["end"] = [CoordToMMs(pcb.board.BoardOutline.Segments(k).vx).round(), -CoordToMMs(pcb.board.BoardOutline.Segments(k).vy).round()];
        //         edges[i]["type"] = "segment";
        //         edges[i]["width"] = default_width;
        //         edges[i]["layer"] = pcb.Layers.OUTLINE_LAYER;
        //     }
        //     else {
        //         edges[i]["start"] = [CoordToMMs(pcb.board.BoardOutline.Segments(i).cx).round(), -CoordToMMs(pcb.board.BoardOutline.Segments(i).cy).round()];
        //         edges[i]["startangle"] = -pcb.board.BoardOutline.Segments(i).Angle2;
        //         edges[i]["endangle"] = -pcb.board.BoardOutline.Segments(i).Angle1;
        //         edges[i]["type"] = "arc";
        //         edges[i]["radius"] = CoordToMMs(pcb.board.BoardOutline.Segments(i).Radius).round();
        //         edges[i]["width"] = default_width;
        //         edges[i]["layer"] = pcb.Layers.OUTLINE_LAYER;
        //     }
        // }

        var Iter, Prim;
        Iter = pcb.board.BoardIterator_Create;
        Iter.AddFilter_ObjectSet(MkSet(eArcObject, eTrackObject));
        Iter.AddFilter_LayerSet(MkSet(pcb.Layers.OUTLINE_LAYER));
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

    // 90% done  // use the KiCad's font , not support chinese char.
    function parseText(Prim) {
        var res = {};
        if (Prim.IsHidden) {
            return res;
        }
        else if (Prim.TextKind == eText_BarCode) {
            return res;  //  an API in AD called ConvetToStrokeArray, how to use it?
        }

        var len = Prim.Text.length;
        if (len == 0) {
            return res;
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
        res["angle"] = Prim.Rotation.round();
        res["layer"] = Prim.Layer;

        var bbox = get_bbox(Prim);
        res["pos"] = bbox["center"];

        if (Prim.TextKind == 0) {
            res["thickness"] = CoordToMMs(Prim.Width).round();
            res["height"] = CoordToMMs(Prim.Size).round();
            res["width"] = res["height"].round(); // single char's width in kicad
        } else if (Prim.TextKind == 1) {
            res["height"] = CoordToMMs(Prim.TTFTextHeight * 0.6).round();
            res["width"] = CoordToMMs(Prim.TTFTextWidth * 0.9 / len).round();
            res["thickness"] = CoordToMMs(res["height"] * 0.1).round();
        }

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

        var Iter, Prim;
        var isSMD = true;
        Iter = Component.GroupIterator_Create;
        Iter.AddFilter_ObjectSet(MkSet(ePadObject));
        Iter.AddFilter_LayerSet(AllLayers);
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

        var bbox = get_bbox(Component);
        oFootprint["center"] = bbox.center;
        delete bbox.center;
        oFootprint["bbox"] = bbox;
        oFootprint["pads"] = pads;
        oFootprint["ref"] = Component.Name.Text;
        if (Component.Layer == eTopLayer) {
            oFootprint["layer"] = "F";
        }
        else {
            oFootprint["layer"] = "B";
        }

        res["footprint"] = oFootprint;

        oComponent["ref"] = oFootprint.ref;
        oComponent["val"] = Component.Comment.Text;
        oComponent["footprint"] = Component.Pattern;
        oComponent["layer"] = oFootprint["layer"];
        oComponent["attr"] = null;

        res["angle"] = Component.Rotation.round();
        res["itemkey"] = ["k", oComponent["ref"].slice(0, 1), oComponent["footprint"], oComponent["val"]].join("");
        
        if (isSMD) {
            res["soldertype"] = "smd";
        }
        else {
            res["soldertype"] = "th";
        }

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
    if (PCBServer == null) {
        showmessage("Please open a PCB document");
        return false;
    }
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

    pcb.pos.push(CoordToMMs(board.XOrigin).round());
    pcb.pos.push(CoordToMMs(board.YOrigin).round());

    var Iter, Prim; 
    Iter = pcb.board.BoardIterator_Create;
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
                    if (config.include.vias) {
                        footprintNoBom.pads = footprintNoBom.pads.concat(parseVia(Prim));
                    }
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
    // pcb.pcbdata["fabrication"] = parseDrawingsOnLayers(drawings, pcb.Layers.TOP_DIMENSIONS_LAYER, pcb.Layers.BOT_DIMENSIONS_LAYER);
    pcb.pcbdata["fabrication"] = {
        "F": [],
        "B": []
    };
    
    // rough handling tracks and zones, not done
    Iter = pcb.board.BoardIterator_Create;

    if (config.include.tracks && !config.include.polys) {
        Iter.AddFilter_ObjectSet(MkSet(eTrackObject, eArcObject));
    } else if (config.include.polys && !config.include.tracks) {
        Iter.AddFilter_ObjectSet(MkSet(eFillobject, eRegionObject, ePolyObject));
    } else if (config.include.polys && config.include.tracks) {
        Iter.AddFilter_ObjectSet(MkSet(eFillobject, eRegionObject, ePolyObject, eArcObject, eTrackObject));
    } else {
        Iter.AddFilter_ObjectSet(MkSet());
    }

    Iter.AddFilter_LayerSet(MkSet(eTopLayer, eBottomLayer));
    Iter.AddFilter_Method(eProcessAll);
    var draws = {};
    draws["tracks"] = [];
    draws["polygons"] = [];
    draws["arcs"] = [];
    Prim = Iter.FirstPCBObject;
    while (Prim != null) {
        if (Prim.InComponent || Prim.InPolygon) {
            Prim = Iter.NextPCBObject;
            continue; 
        }

        switch (Prim.ObjectId) {
            case eTrackObject:
                draws.tracks.push(parseTrack(Prim));
                break;
            case eArcObject:
                if (Prim.IsFreePrimitive) {
                    draws.tracks = draws.tracks.concat(parseArc(Prim));
                } else {
                    // draws.arcs.push(parseArc(Prim));
                }
                break;
            case eFillobject:
                draws.polygons.push(parseFill(Prim));
                break;
            case eRegionObject:
                draws.polygons.push(parseRegion(Prim));
                break;    
            case ePolyObject:
                if ((Prim.PolyHatchStyle != ePolySolid) && (!config.include.polyHatched)) {
                    break; 
                }
                draws.polygons = draws.polygons.concat(parsePoly(Prim));
                break;                   
            default:
        }    
        Prim = Iter.NextPCBObject;
    }
    pcb.board.BoardIterator_Destroy(Iter);

    if (config.include.tracks || config.include.polys) {
        pcb.pcbdata["tracks"] = parseDrawingsOnLayers(draws.tracks, eTopLayer, eBottomLayer);  
        pcb.pcbdata["zones"] = parseDrawingsOnLayers(draws.polygons, eTopLayer, eBottomLayer);  
    }

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
                        ((coord.charCodeAt(0) - "R".charCodeAt(0)) * STROKE_FONT_SCALE - glyph_x).round(),
                        ((coord.charCodeAt(1) - "R".charCodeAt(0) + FONT_OFFSET) * STROKE_FONT_SCALE).round()
                        ])
                }
            }

            if (line.length > 0) {
                lines.push(line);
            }
            return {
                "w": glyph_width.round(),
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
// var pcb = parsePcb();
