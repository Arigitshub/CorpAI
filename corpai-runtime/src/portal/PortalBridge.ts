import * as fs from "fs";
import * as path from "path";
import { GatewayServer } from "../gateway/GatewayServer";

export interface PortalBridgeOptions {
  portalPublicDir?: string;
  syncIntervalMs?: number;
  autoSync?: boolean;
}

export class PortalBridge {
  private readonly gateway: GatewayServer;
  private readonly feedPath: string;
  private readonly syncIntervalMs: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(gateway: GatewayServer, options: PortalBridgeOptions = {}) {
    this.gateway = gateway;
    const portalDir = options.portalPublicDir || path.resolve(process.cwd(), "..", "corpai-portal", "public");
    this.feedPath = path.join(portalDir, "corpai-team-status.json");
    this.syncIntervalMs = options.syncIntervalMs ?? 4000;

    if (options.autoSync) {
      this.start();
    }
  }

  public writeFeed(): any {
    const feed = this.gateway.generateFeed();
    try {
      fs.mkdirSync(path.dirname(this.feedPath), { recursive: true });
      fs.writeFileSync(this.feedPath, `${JSON.stringify(feed, null, 2)}\n`);
    } catch {
      // Ignore if portal directory does not exist in testing
    }
    return feed;
  }

  public start(): void {
    if (this.timer) return;
    this.writeFeed();
    this.timer = setInterval(() => this.writeFeed(), this.syncIntervalMs);
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
