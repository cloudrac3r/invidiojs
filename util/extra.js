const crypto = require("crypto");
const util = require("util");
const fs = require("fs");

module.exports = function ({db}) {
    const extra = {
        treeToText: function(tree) {
            if (tree.tagName) {
                const noclose = ["img", "br"];
                let text = "";
                text += "<"+tree.tagName;
                if (tree.rawAttrs) text += " "+tree.rawAttrs;
                text += ">";
                tree.childNodes.forEach(node => {
                    text += extra.treeToText(node)
                });
                if (!noclose.includes(tree.tagName)) text += "</"+tree.tagName+">";
                return text;
            } else {
                return tree.rawText;
            }
        },
        generateThumbnailURLs: function(videoID) {
            return [
                {
                    "quality": "maxresdefault",
                    "width": 1280,
                    "height": 720
                },
                {
                    "quality": "sddefault",
                    "width": 640,
                    "height": 480
                },
                {
                    "quality": "high",
                    "width": 480,
                    "height": 360
                },
                {
                    "quality": "medium",
                    "width": 320,
                    "height": 180
                },
                {
                    "quality": "default",
                    "width": 120,
                    "height": 90
                }
            ].map(format => {
                format.url = `https://i.ytimg.com/vi/${videoID}/${format.quality}.jpg`;
                return format;
            });
        },
        formattedTimeToSeconds: function(time) {
            return time.split(":").reduce((a, c, i, arr) => (a + (c*60**(arr.length-i-1))), 0)
        },
        relativeDateToTimestamp: function(date) {
            if (date.toLowerCase().includes("today")) return Date.now()-12*60*60;
            if (date.toLowerCase().includes("yesterday")) return Date.now()-36*60*60;
            if (new Date(date).getTime()) return new Date(time).getTime();
            let [number, multiplier] = date.split(" ");
            number = +number;
            //if (multiplier.includes("second")) number *= 1000;
            if (multiplier.includes("minute")) number *= 60;
            else if (multiplier.includes("hour")) number *= 60*60;
            else if (multiplier.includes("day")) number *= 24*60*60;
            else if (multiplier.includes("week")) number *= 7*24*60*60;
            else if (multiplier.includes("month")) number *= 30*24*60*60;
            else if (multiplier.includes("year")) number *= 365*24*60*60;
            return Date.now()/1000-number;
        }
    };
    return extra;
}