import { proto } from "baileys";
import { COMMAND_METADATA_KEY, CommandOptions } from "../decorators/command";

type CommandHandler = (args: string[], message: proto.IWebMessageInfo) => Promise<void>;

interface CommandData extends CommandOptions {
  handler: CommandHandler;
}

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, CommandData> = new Map();
  private aliases: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  public registerCommandInstance(instance: any): void {
    const prototype = Object.getPrototypeOf(instance);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (prop) => prop !== "constructor" && typeof instance[prop] === "function"
    );

    for (const methodName of methodNames) {
      const metadata: CommandOptions = Reflect.getMetadata(
        COMMAND_METADATA_KEY,
        prototype,
        methodName
      );

      if (metadata) {
        const commandName = metadata.name.startsWith("!") ? metadata.name : `!${metadata.name}`;
        
        this.commands.set(commandName, {
          ...metadata,
          handler: instance[methodName].bind(instance),
        });

        if (metadata.aliases) {
          for (const alias of metadata.aliases) {
            const aliasName = alias.startsWith("!") ? alias : `!${alias}`;
            this.aliases.set(aliasName, commandName);
          }
        }
      }
    }
  }

  public async executeCommand(commandName: string, args: string[], message: proto.IWebMessageInfo): Promise<boolean> {
    // Check if it's a direct command
    const command = this.commands.get(commandName);
    
    if (command) {
      await command.handler(args, message);
      return true;
    }
    
    // Check if it's an alias
    const aliasedCommand = this.aliases.get(commandName);
    if (aliasedCommand) {
      const cmd = this.commands.get(aliasedCommand);
      if (cmd) {
        await cmd.handler(args, message);
        return true;
      }
    }
    
    return false;
  }

  public getCommands(): Map<string, CommandData> {
    return this.commands;
  }
} 