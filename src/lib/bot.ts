import { bskyAccount, bskyService } from "./config.js";
import { createCanvas, createImageData, Image } from 'canvas'
import type {
  AppBskyFeedPost,
  AtpAgentLoginOpts,
  AtpAgentOptions,
} from "@atproto/api";
import { AtpAgent, RichText } from "@atproto/api";

interface BotOptions {
  service: string | URL;
  dryRun: boolean;
}

function convertDataURIToUint8Array(dataURI: string): Uint8Array {
  const base64Data = dataURI.split(",")[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default class Bot {
  #agent;

  static defaultOptions: BotOptions = {
    service: bskyService,
    dryRun: false,
  } as const;

  constructor(service: AtpAgentOptions["service"]) {
    this.#agent = new AtpAgent({ service });
  }

  login(loginOpts: AtpAgentLoginOpts) {
    return this.#agent.login(loginOpts);
  }

  async post(arr : Uint8ClampedArray) {
    let imageData = createImageData(arr, 500, 500);
    console.log(imageData)
    var canvas = createCanvas(500,500);
    var ctx = canvas.getContext('2d');
    ctx!.putImageData(imageData, 0, 0);
    const { data } = await this.#agent.uploadBlob(convertDataURIToUint8Array(canvas.toDataURL()))
    await this.#agent.post({
      text: '',
      embed: {
        $type: 'app.bsky.embed.images',
        images: [
          // can be an array up to 4 values
          {
            alt: 'Randomly generated image', // the alt text
            image: data.blob,
            aspectRatio: {
              // a hint to clients
              width: 500,
              height: 500
            }
        }],
      },
      createdAt: new Date().toISOString()
    })
  }

  static async run(
    getPostText: () => Promise<Uint8ClampedArray>,
    botOptions?: Partial<BotOptions>,
  ) {
    const { service, dryRun } = botOptions
      ? Object.assign({}, this.defaultOptions, botOptions)
      : this.defaultOptions;
    const bot = new Bot(service);
    await bot.login(bskyAccount);
    const text = (await getPostText());
    if (!dryRun) {
      await bot.post(text);
    } else {
      console.log(text);
    }
    return text;
  }
}
