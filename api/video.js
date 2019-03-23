const rp = require("request-promise-native").defaults({forever: true});
const fhp = require("fast-html-parser");

function extractDetailsFromHTML(html) {
	let indexStart = html.indexOf("ytplayer.config = ")+18;
	let indexEnd = html.indexOf("};", indexStart)+1;
	let slice = html.slice(indexStart, indexEnd);
	let config = JSON.parse(slice);
	let response = JSON.parse(config.args.player_response);
	return {config, response};
}

module.exports = ({extra}) => [
	{
		route: "/api/v(\\d+)/videos/([\\w-]+)", methods: ["GET"], code: async ({fill, params}) => {
			let pretty = !!params.pretty;
			let useFold = !params.fold;
			let v = +fill[0];
			let html = await rp(`https://www.youtube.com/watch?v=${fill[1]}`);
			//console.log(Date.now());
			let dom = fhp.parse(html);
			//console.log(Date.now());
			let details = extractDetailsFromHTML(html);
			//console.log(Date.now());
			let fold = {
				title: details.response.videoDetails.title,
				videoId: details.response.videoDetails.videoId,
				videoThumbnails: extra.generateThumbnailURLs(details.response.videoDetails.videoId),
				description: details.response.videoDetails.shortDescription,
				descriptionHtml: extra.treeToText(dom.querySelector("#eow-description")),
				published: new Date(dom.querySelector("#watch7-content").childNodes.find(node => node.attributes && node.attributes.itemprop == "datePublished").attributes.content).getTime()/1000,
				//published
				keywords: details.response.videoDetails.keywords,
				viewCount: +details.response.videoDetails.viewCount,
				//likeCount
				//dislikeCount
				//paid
				//premium
				//isFamilyFriendly
				//allowedRegions
				//genre
				//genreUrl
				author: details.response.videoDetails.author,
				authorId: details.response.videoDetails.channelId,
				//subCountText
				lengthSeconds: +details.response.videoDetails.lengthSeconds,
				allowRatings: details.response.videoDetails.allowRatings,
				rating: details.response.videoDetails.averageRating,
				adaptiveFormats: details.response.streamingData.adaptiveFormats.map(format =>
					Object.assign(format, {
						index: format.indexRange ? format.indexRange.start+"-"+format.indexRange.end : "-2",
						clen: format.contentLength,
						type: format.mimeType,
						container: format.mimeType.match(/\/(\w+);/)[1],
						resolution: format.height+"p"
					})
				).sort((a, b) => (b.height - a.height)),
				formatStreams: details.response.streamingData.formats.map(format =>
					Object.assign(format, {
						type: format.mimeType,
						container: format.mimeType.match(/\/(\w+);/)[1],
						resolution: format.height+"p"
					})
				).sort((a, b) => (b.height - a.height)),
				//captions
				recommendedVideos: dom.querySelectorAll(".related-list-item").map(item => ({
					videoId: item.childNodes[1].childNodes[1].attributes.href.match(/v=([\w-]+)/)[1],
					title: item.childNodes[1].childNodes[1].attributes.title,
					author: item.childNodes[1].childNodes[1].childNodes[5].text,
					viewCountText: item.childNodes[1].childNodes[1].childNodes[7].text,
					lengthSeconds: item.childNodes[3].childNodes[1].text.split(":").reduce((a, c, i, arr) => (a + (c*60**(arr.length-i-1))), 0),
					lengthText: item.childNodes[3].childNodes[1].text,
					videoThumbnails: extra.generateThumbnailURLs(details.response.videoDetails.videoId)
				}))
			};
			let result = pretty ? JSON.stringify(useFold ? fold : details, null, 2) : JSON.stringify(useFold ? fold : details);
			return [200, result];
		}
	}
]