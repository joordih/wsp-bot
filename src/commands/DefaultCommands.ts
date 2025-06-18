import { downloadContentFromMessage, proto } from "baileys";
import Sticker, { StickerTypes } from "wa-sticker-formatter";
import fs from "fs";
import path from "path";
import os from "os";
import { Command } from "../decorators/command";
import { BaseCommand } from "./BaseCommand";

export class DefaultCommands extends BaseCommand {
  @Command({
    name: "kanye",
    description: "Says something about Kanye",
    aliases: ["ye"],
  })
  async handleKanye(
    args: string[],
    message: proto.IWebMessageInfo
  ): Promise<void> {
    const jid = message.key!.remoteJid!;

    await this.readMessage(message);

    if (args.length === 0) {
      await this.sendMessageWithTyping(
        { text: "Nazi y que pedazo de nazi además." },
        jid,
        message
      );
      return;
    }

    if (args.length >= 1) {
      const quote: string = args.join(" ");
      await this.sendMessageWithTyping(
        { text: `Kanye es: ${quote}. Y además lo es mucho.` },
        jid,
        message
      );
    }
  }

  @Command({
    name: "unai",
    description: "Says something about Unai",
  })
  async handleUnai(
    args: string[],
    message: proto.IWebMessageInfo
  ): Promise<void> {
    const jid = message.key!.remoteJid!;

    await this.readMessage(message);

    if (args.length === 0) {
      await this.sendMessageWithTyping(
        { text: "Unai es un nazi." },
        jid,
        message
      );
      return;
    }

    if (args.length >= 1) {
      const quote: string = args.join(" ");
      await this.sendMessageWithTyping(
        { text: `Unai es: ${quote}. Y además lo es mucho.` },
        jid,
        message
      );
    }
  }

  @Command({
    name: "jorgejavier",
    description: "Says something about Jorge Javier",
    aliases: ["jj"],
  })
  async handleJorgeJavier(
    args: string[],
    message: proto.IWebMessageInfo
  ): Promise<void> {
    const jid = message.key!.remoteJid!;

    await this.readMessage(message);

    if (args.length === 0) {
      await this.sendMessageWithTyping(
        {
          text: "Jorge Javier es al que tu madre se la chupa todas las noches.",
        },
        jid,
        message
      );
      return;
    }

    if (args.length >= 1) {
      const quote: string = args.join(" ");
      await this.sendMessageWithTyping(
        { text: `Jorge Javier es: ${quote}. Y además lo es mucho.` },
        jid,
        message
      );
    }
  }

  @Command({
    name: "rush",
    description: "Says something about Rush",
    aliases: ["rush"],
  })
  async handleRush(
    args: string[],
    message: proto.IWebMessageInfo
  ): Promise<void> {
    const jid = message.key!.remoteJid!;

    await this.readMessage(message);

    console.log(args.length);
    console.log(args[0]);
    console.log(args[1]);

    if (args.length === 0) {
      await this.sendMessageWithTyping(
        { text: "Rush fuera del grupo mariconazo y kpoper de mierda." },
        jid,
        message
      );
      return;
    }

    if (args.length >= 1 && args.length != 2) {
      const quote: string = args.join(" ");
      await this.sendMessageWithTyping(
        { text: `Rush es: ~${quote}~ KPOPER Y MARICÓN. Y además lo es mucho.` },
        jid,
        message
      );
    }

    if (args.length == 2 && args[0] === "pussy" && args[1] === "destroyer") {
      await this.sendMessageWithTyping(
        {
          text: "Que va a ser rush un pussy destroyer, si es más maricón que Koeman.",
        },
        jid,
        message
      );
    }
  }

  @Command({
    name: "viewonce",
    description: "Downloads and sends an image from a viewOnce message",
    aliases: ["leakphoto", "view"],
  })
  async handleBaileysImagen(
    args: string[],
    message: proto.IWebMessageInfo
  ): Promise<void> {
    const jid = message.key!.remoteJid!;

    await this.readMessage(message);

    const quotedMessage =
      message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMessage) {
      await this.sendMessageWithTyping(
        {
          text: "Por favor, responde a un mensaje viewOnce para lekear la foto.",
        },
        jid,
        message
      );
      return;
    }

    const viewOnceMessage =
      quotedMessage.viewOnceMessage ||
      quotedMessage.viewOnceMessageV2 ||
      quotedMessage.viewOnceMessageV2Extension;

    if (!viewOnceMessage) {
      await this.sendMessageWithTyping(
        { text: "El mensaje al que respondes no es de tipo viewOnce." },
        jid,
        message
      );
      return;
    }

    try {
      const actualMessage = viewOnceMessage.message;

      if (actualMessage?.imageMessage) {
        const stream = await downloadContentFromMessage(
          actualMessage.imageMessage,
          "image"
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        await this.sendMessageWithTyping(
          {
            image: buffer,
            caption: "👀 Imagen ViewOnce recuperada",
          },
          jid,
          message
        );
      } else if (actualMessage?.videoMessage) {
        const stream = await downloadContentFromMessage(
          actualMessage.videoMessage,
          "video"
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        await this.sendMessageWithTyping(
          {
            video: buffer,
            caption: "👀 Video ViewOnce recuperado",
          },
          jid,
          message
        );
      } else {
        await this.sendMessageWithTyping(
          { text: "Contenido viewOnce no soportado." },
          jid,
          message
        );
      }
    } catch (error) {
      console.error("Error processing viewOnce message:", error);
      await this.sendMessageWithTyping(
        { text: "Error al procesar el mensaje viewOnce." },
        jid,
        message
      );
    }
  }

  @Command({
    name: "sticker",
    description: "Convierte imágenes y GIFs a stickers de WhatsApp",
    aliases: ["s", "stick"],
  })
  async handleSticker(
    args: string[],
    message: proto.IWebMessageInfo
  ): Promise<void> {
    const jid = message.key!.remoteJid!;

    await this.readMessage(message);

    let imageMessage = message.message?.imageMessage;
    let videoMessage = message.message?.videoMessage;

    if (!imageMessage && !videoMessage) {
      const quotedMessage =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quotedMessage) {
        imageMessage = quotedMessage.imageMessage;
        videoMessage = quotedMessage.videoMessage;
      }
    }

    if (!imageMessage && !videoMessage) {
      await this.sendMessageWithTyping(
        {
          text: "❌ Por favor, adjunta una imagen o GIF junto al comando !sticker, o responde a un mensaje que contenga una imagen/GIF.",
        },
        jid,
        message
      );
      return;
    }

    try {
      let buffer: Buffer;
      let isAnimated = false;
      let tempFilePath: string | undefined;

      try {
        if (imageMessage) {
          const stream = await downloadContentFromMessage(
            imageMessage,
            "image"
          );
          buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
        } else if (videoMessage) {
          const stream = await downloadContentFromMessage(
            videoMessage,
            "video"
          );
          buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          isAnimated = true;
        } else {
          await this.sendMessageWithTyping(
            {
              text: "❌ Formato no soportado. Solo se admiten imágenes y GIFs.",
            },
            jid,
            message
          );
          return;
        }

        const tempDir = os.tmpdir();
        const fileName = `sticker_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`;
        const extension = isAnimated ? ".gif" : ".png";
        tempFilePath = path.join(tempDir, fileName + extension);

        fs.writeFileSync(tempFilePath, buffer);

        const stickerOptions = {
          quality: 100,
          type: StickerTypes.FULL,
          author: "Joordih - Bot",
          pack: "orgia.sql",
        };

        if (!isAnimated) {
          stickerOptions.type = StickerTypes.CROPPED;
        }

        const sticker = new Sticker(buffer, stickerOptions);
        const stickerMedia = await sticker.toBuffer();

        const options = {
          sticker: stickerMedia,
          fileName: `sticker${extension}`,
          isAnimated: isAnimated,
        };

        await this.sendMessageWithTyping(options, jid, message);
      } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath);
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError);
          }
        }
      }
    } catch (error) {
      console.error("Error processing sticker:", error);
      await this.sendMessageWithTyping(
        {
          text: "❌ Error al procesar el sticker. Asegúrate de que el archivo sea una imagen o GIF válido.",
        },
        jid,
        message
      );
    }
  }
}
