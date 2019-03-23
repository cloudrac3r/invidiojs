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
        }
    };
    return extra;
}