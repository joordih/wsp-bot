import { AnyMessageContent, delay, proto } from "baileys";

export abstract class BaseCommand {
  protected socket: any;

  constructor(socket: any) {
    this.socket = socket;
  }

  protected async sendMessageWithTyping(
    msg: AnyMessageContent, 
    jid: string, 
    message: proto.IWebMessageInfo
  ): Promise<void> {
    await this.socket.presenceSubscribe(jid);
    await delay(500);
  
    await this.socket.sendPresenceUpdate('composing', jid);
    await delay(2000);
  
    await this.socket.sendPresenceUpdate('paused', jid);
  
    await this.socket.sendMessage(jid, msg, { quoted: message });
  }

  protected async readMessage(message: proto.IWebMessageInfo): Promise<void> {
    await this.socket.readMessages([message.key!]);
  }
} 