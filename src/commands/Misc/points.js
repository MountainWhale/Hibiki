const Command = require("structures/Command");
const format = require("utils/format");
const fetch = require("node-fetch");

class pointsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["merits", "rep", "reps", "reputation"],
      args: "<member:member&fallback>",
      description: "Shows what reputation points a member has.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const points = await this.bot.db.table("points").filter({
      receiver: user.id,
      guild: msg.channel.guild.id,
    });

    if (!points.length) return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** has no reputation points.`, "error"));
    // Uploads to hasteb.in if over 20
    if (points.length > 20) {
      // Joins points
      const pointstring = `${points.map(m => `${m.id} (by ${format.tag(msg.channel.guild.members.get(m.giver) || { username: `Unknown User (${m.giverId})`, discriminator: "0000" })})\n${m.reason}`).join("\n\n")}`;
      const body = await fetch("https://hasteb.in/documents", { referrer: "https://hasteb.in/", body: pointstring, method: "POST", mode: "cors" })
        .then(async res => await res.json().catch(() => {}));
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** has more than 20 points. View them [here](https://hasteb.in/${body.key}).`, "error"));
    }

    await msg.channel.createMessage({
      embed: {
        title: `✨ ${user.username} has ${points.length} point${points.length === 1 ? "" : "s"}.`,
        color: this.bot.embed.color("general"),
        fields: points.map(m => ({
          name: `${m.id} - from **${msg.channel.guild.members.get(m.giver) ? msg.channel.guild.members.get(m.giver).username : m.giver}**`,
          value: `${m.reason.slice(0, 150) || "No reason given."}`,
        })),
      },
    });
  }
}

module.exports = pointsCommand;