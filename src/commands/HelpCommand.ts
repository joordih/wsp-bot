import { proto } from "baileys";
import { Command } from "../decorators/command";
import { BaseCommand } from "./BaseCommand";
import { CommandRegistry } from "../services/CommandRegistry";

export class HelpCommand extends BaseCommand {
  @Command({
    name: "help",
    description: "Lists all available commands",
    aliases: ["commands", "?"]
  })
  async handleHelp(args: string[], message: proto.IWebMessageInfo): Promise<void> {
    const jid = message.key!.remoteJid!;
    await this.readMessage(message);
    
    const commandRegistry = CommandRegistry.getInstance();
    const commands = commandRegistry.getCommands();
    
    let helpText = "📋 *Available Commands:*\n\n";
    
    helpText += "```";
    commands.forEach((cmd, commandName) => {
      helpText += `*${commandName}*`;
      if (cmd.description) {
        helpText += `: ${cmd.description}`;
      }
      if (cmd.aliases && cmd.aliases.length > 0) {
        helpText += ` (Aliases: ${cmd.aliases.map(a => `!${a}`).join(", ")})`;
      }
      helpText += "\n";
    });
    
    helpText += "\nUse !command [arguments] to execute a command";
    helpText += "```";

    await this.sendMessageWithTyping({ text: helpText }, jid, message);
  }
} 