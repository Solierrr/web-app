export class InvalidPropError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPropError";
  }

  static missingProps(component: string, props: string[]): InvalidPropError {
    const propList = props.map((prop) => `\`${prop}\``).join(" ou ");
    return new InvalidPropError(`${component}: informe ${propList}.`);
  }
}
