import { JsonRpcException } from "../protocol/errors";
import { MethodContext, MethodRegistration, MiddlewareFn, RpcMethodHandler } from "./types";

export class MethodRouter {
  private readonly methods = new Map<string, MethodRegistration>();
  private readonly middlewares: MiddlewareFn[] = [];

  constructor() {
    // Register built-in discovery
    this.register("rpc.discover", () => this.discover(), "Discover available JSON-RPC 2.0 methods");
  }

  /**
   * Register a middleware function.
   */
  public use(middleware: MiddlewareFn): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Register a JSON-RPC method handler.
   */
  public register<TParams = any, TResult = any>(
    name: string,
    handler: RpcMethodHandler<TParams, TResult>,
    description?: string,
    paramSchema?: unknown
  ): this {
    if (!name || typeof name !== "string") {
      throw new Error("Method name must be a non-empty string");
    }
    this.methods.set(name, {
      name,
      handler,
      description,
      paramSchema,
    });
    return this;
  }

  /**
   * Unregister a method.
   */
  public unregister(name: string): boolean {
    return this.methods.delete(name);
  }

  /**
   * Check if method is registered.
   */
  public has(name: string): boolean {
    return this.methods.has(name);
  }

  /**
   * Get method registration details.
   */
  public get(name: string): MethodRegistration | undefined {
    return this.methods.get(name);
  }

  /**
   * Execute a method through the middleware pipeline.
   */
  public async execute(
    method: string,
    params: unknown,
    context: MethodContext
  ): Promise<unknown> {
    const registration = this.methods.get(method);
    if (!registration) {
      throw JsonRpcException.methodNotFound(method);
    }

    // Build middleware execution chain
    let index = 0;
    const runMiddleware = async (): Promise<unknown> => {
      if (index < this.middlewares.length) {
        const current = this.middlewares[index++];
        return current(method, params, context, runMiddleware);
      }
      return registration.handler(params, context);
    };

    return runMiddleware();
  }

  /**
   * Discover available methods.
   */
  public discover(): Array<{ name: string; description?: string }> {
    return Array.from(this.methods.values()).map((m) => ({
      name: m.name,
      description: m.description,
    }));
  }

  /**
   * Clear all non-builtin methods (useful for testing).
   */
  public clear(): void {
    this.methods.clear();
    this.register("rpc.discover", () => this.discover(), "Discover available JSON-RPC 2.0 methods");
  }
}
