const rp = require("request-promise-native").defaults({forever: true});
const fhp = require("fast-html-parser");

module.exports = ({cf, extra}) => {
	function headerElementToAuthorDetails(dom, headerElement) {
		return {
			author: headerElement.text,
			authorId: dom.childNodes[0].childNodes[0].childNodes.find(element => element.attributes && element.attributes.itemprop == "channelId").attributes.content,
			authorUrl: headerElement.attributes.href
		}
	}

	function videosPageToLatest(dom) {
		let headerElement = dom.querySelector(".branded-page-header-title-link");
		let authorDetails = headerElementToAuthorDetails(dom, headerElement);
		let latestVideos = dom.querySelector("#browse-items-primary").childNodes
		.filter(item => item.tagName == "li" && item.classNames.includes("feed-item-container"))
		.map(item => {
			let itemInner = item.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1];
			let h3 = itemInner.childNodes[3].childNodes.find(child => child.tagName == "h3");
			let videoId = h3.childNodes[0].attributes.href.replace("/watch?v=", "");
			let descriptionElement = itemInner.childNodes[3].childNodes.find(child => child.classNames && child.classNames.includes("yt-lockup-description"));
			return Object.assign({
				title: h3.childNodes[0].attributes.title,
				videoId,
				videoThumbnails: extra.generateThumbnailURLs(videoId),
				description: descriptionElement ? descriptionElement.text.trim() : "",
				descriptionHtml: descriptionElement ? extra.treeToText(descriptionElement) : "",
				viewCount: +itemInner.childNodes[3].childNodes[3].childNodes[1].childNodes[2].text.split(" ")[0].replace(/,/g, ""),
				viewCountText: itemInner.childNodes[3].childNodes[3].childNodes[1].childNodes[2].text,
				published: extra.relativeDateToTimestamp(itemInner.childNodes[3].childNodes[3].childNodes[1].childNodes[1].text),
				publishedText: itemInner.childNodes[3].childNodes[3].childNodes[1].childNodes[1].text,
				lengthSeconds: extra.formattedTimeToSeconds(itemInner.childNodes[1].childNodes[1].childNodes[2].text)
				//liveNow
				//paid
				//premium
			}, authorDetails);
		})
		return latestVideos;
	}

	return [
		{
			route: "/api/v(\\d+)/channels/([\\w-]+)", methods: ["GET"], code: async ({fill, params}) => {
				let pretty = !!params.pretty;
				let v = +fill[0];
				let mode = fill[1].match(/UC[\w-]{22}/) ? "channel" : "user";
				let html = await rp(`https://www.youtube.com/${mode}/${fill[1]}/videos?disable_polymer=1&flow=list`);
				let dom = fhp.parse(html);
				let latestVideos = videosPageToLatest(dom);
				let headerElement = dom.querySelector(".branded-page-header-title-link");
				let authorDetails = headerElementToAuthorDetails(dom, headerElement);
				let authorBanners = [];
				(function locateAuthorBanners(offset = 0) {
					let idIndex = html.indexOf("#c4-header-bg-container", offset);
					if (idIndex != -1) {
						let backgroundIndex = html.indexOf("//", idIndex);
						let newlineIndex = html.indexOf("\n", backgroundIndex);
						let extract = html.slice(backgroundIndex+2, newlineIndex-2);
						if (!extract.includes(" ")) {
							authorBanners.push({
								url: "https://"+extract,
								width: extract.match(/=w(\d+)/)[1],
								height: null
							});
						}
						locateAuthorBanners(newlineIndex);
					}
				})();
				let authorThumbnails = [];
				(function() {
					let authorThumbnailSrc = dom.querySelector("#c4-header-bg-container").childNodes[5].childNodes[1].attributes.src;
					let size = authorThumbnailSrc.match(/=s(\d+)/)[1];
					authorThumbnails.push({
						url: authorThumbnailSrc,
						width: size,
						height: size
					});
				})();
				let fold = Object.assign({
					authorBanners,
					authorThumbnails,
					subcount: +dom.querySelector(".yt-subscription-button-subscriber-count-branded-horizontal").attributes.title.replace(/,/g, ""),
					//totalviews
					//joined
					//paid
					//autoGenerated
					//isFamilyFriendly
					//description
					//descriptionHtml
					//allowedRegions
					latestVideos
					//relatedChannels
				}, authorDetails);
				let result = pretty ? JSON.stringify(fold, null, 2) : fold;
				return [200, result];
			}
		},
		{
			route: "/api/v(\\d+)/channels/([\\w-]+)/([\\w-]+)", methods: ["GET"], code: async ({fill, params}) => {
				if (fill[1] == "videos" || fill[1] == "latest") {
					var endpoint = fill[1], user = fill[2];
				} else if (fill[2] == "videos" || fill[2] == "latest") {
					var endpoint = fill[2], user = fill[1];
				} else {
					return [404, `Expected "videos" or "latest" after "/channels/".`];
				}
				let pretty = !!params.pretty;
				let v = +fill[0];
				let mode = user.match(/UC[\w-]{22}/) ? "channel" : "user";
				let html = await rp(`https://www.youtube.com/${mode}/${user}/videos?disable_polymer=1&flow=list`);
				let dom = fhp.parse(html);
				let latestVideos = videosPageToLatest(dom);
				let result = pretty ? JSON.stringify(latestVideos, null, 2) : latestVideos;
				return [200, result];
			}
		}
	]
}