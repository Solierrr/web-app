export class InvalidIconError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidIconError";
  }

  static notFound(name: string): InvalidIconError {
    return new InvalidIconError(`Icon: o ícone \`${name}\` não foi encontrado.`);
  }
}
