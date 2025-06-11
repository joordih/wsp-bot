import NodeCache from "@cacheable/node-cache";
import makeWASocket, { fetchLatestBaileysVersion, proto, useMultiFileAuthState, WAMessageContent, WAMessageKey } from "baileys";
import P from "pino";
import "reflect-metadata";
import { DefaultCommands } from "./commands/DefaultCommands";
import { HelpCommand } from "./commands/HelpCommand";
import { CommandRegistry } from "./services/CommandRegistry";
const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('./wa-logs.txt'));
logger.level = "trace";

const messageRetryCounterCache = new NodeCache();

const startSocket = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version: version,
    logger: logger,
    printQRInTerminal: true,
    auth: state,
    msgRetryCounterCache: messageRetryCounterCache,
    maxMsgRetryCount: 3,
    
    generateHighQualityLinkPreview: true,
    getMessage
  });

  const commandRegistry = CommandRegistry.getInstance();
  const defaultCommands = new DefaultCommands(sock);
  const helpCommand = new HelpCommand(sock);
  
  commandRegistry.registerCommandInstance(defaultCommands);
  commandRegistry.registerCommandInstance(helpCommand);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const message of messages) {

      if (message.message?.conversation) {
        console.log("Conversation");
        console.log(message.message);
        await handleConversation(message);
      } else if (message.message?.extendedTextMessage) {
        console.log("Extended Text Message");
        console.log(message.message);
        await handleExtendedTextMessage(message);
      }
    }
  });

  const handleExtendedTextMessage = async (message: proto.IWebMessageInfo) => {
    const text = message.message!.extendedTextMessage!.text;
    if (!text || !text.startsWith("!")) {
      return;
    }

    const [command, ...args] = text.split(" ");
    console.log(message.message);
    await executeCommand(command, args, message);
  };

  const handleConversation = async (message: proto.IWebMessageInfo) => {
    const text = message.message!.conversation;
    if (!text || !text.startsWith("!")) {
      return;
    }

    const [command, ...args] = text.split(" ");
    console.log(message.message);
    await executeCommand(command, args, message);
  };

  const executeCommand = async (command: string, args: string[], message: proto.IWebMessageInfo) => {
    await commandRegistry.executeCommand(command, args, message);
  };

  return sock;
}

async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
  return proto.Message.fromObject({})
}

startSocket();

