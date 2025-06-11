import "reflect-metadata";

export const COMMAND_METADATA_KEY = "command:metadata";

export interface CommandOptions {
  name: string;
  description?: string;
  aliases?: string[];
}

export function Command(options: CommandOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(COMMAND_METADATA_KEY, options, target, propertyKey);
    return descriptor;
  };
}

export function getCommandMetadata(target: Object, propertyKey: string | symbol): CommandOptions | undefined {
  return Reflect.getMetadata(COMMAND_METADATA_KEY, target, propertyKey);
} 