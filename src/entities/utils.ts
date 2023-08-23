export type MultipleConnectionPointId = `mcp-${number}`;
export type CircuitElementId = `ce-${number}`;

export function generateCircuitElementId(): CircuitElementId {
  const body = Math.floor(Math.random() * Math.pow(10, 17));
  return `ce-${body}`;
}
