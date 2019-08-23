const { Plugin } = require("powercord/entities")
const webpack = require("powercord/webpack")
const { getModuleByDisplayName } = webpack
const { inject, uninject } = require("powercord/injector")
const { getOwnerInstance } = require("powercord/util")

module.exports = class VoiceSS extends Plugin {
	constructor () {
		super()
	}

	async startPlugin () {
		this._patchChannelList()
	}

	pluginWillUnload () {
		uninject("cadence-voicess-channelitem")
	}

	async _patchChannelList() {
		const selectChannel = (await require("powercord/webpack").getModule(["selectChannel"])).selectChannel
		const RCS = await require("powercord/webpack").getModuleByDisplayName("RTCConnectionStatus")
		const ChannelItem = await getModuleByDisplayName("ChannelItem")
		inject("cadence-voicess-channelitem", ChannelItem.prototype, "render", function(_, res) {
			if (res.props.children[1]._owner) {
				let channel = res.props.children[1]._owner.pendingProps.channel
				if (channel.type == 2) {
					let old = res.props.onClick
					res.props.onClick = function(event) {
						if (event.ctrlKey) selectChannel(channel.guild_id, channel.id)
						else if (old) old(event)
					}
				}
			}
			return res
		})
		inject("cadence-voicess-rcs", RCS.prototype, "render", function(_, res) {
			let rtc = document.querySelector(".container-1giJp5")
			if (!rtc) return
			let channel = getOwnerInstance(rtc).props.channel
			let link = res.props.children[1].props.children[1]
			let old = link.props.onClick
			link.props.onClick = function(event) {
				if (event.ctrlKey) {
					event.preventDefault()
					selectChannel(channel.guild_id, channel.id)
				} else if (old) {
					old(event)
				}
			}
			return res
		})
	}
}
