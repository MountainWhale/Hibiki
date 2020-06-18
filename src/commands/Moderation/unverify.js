const Command = require("structures/Command");
const format = require("utils/format");

class unverifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ut", "untrust", "uv"],
      args: "<member:member>",
      description: "Removes the verified role from A member.",
      clientperms: "manageRoles",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    // If no role or cfg
    if (!guildcfg || !guildcfg.verifiedRole) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id });
      return msg.channel.createMessage(this.bot.embed("❌ Error", "The verified role hasn't been configured yet.", "error"));
    }

    // If member doesn't have the verified role
    if (!user.roles.includes(guildcfg.verifiedRole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** doesn't have the verified role.`, "error"));
    }

    // Removes the role
    await user.removeRole(guildcfg.verifiedRole, `Unverified by ${format.tag(msg.author, true)}`).catch(() => {
      msg.channel.createMessage(this.bot.embed("❌ Error", `Failed to unverify **${user.username}**.`));
    });

    this.bot.emit("memberUnverify", msg.channel.guild, msg.member, user);
    msg.channel.createMessage(this.bot.embed("✅ Success", `The verified role was removed from **${user.username}**.`, "success"));
  }
}

module.exports = unverifyCommand;