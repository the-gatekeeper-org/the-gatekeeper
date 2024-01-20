import {
  $nodeInputs,
  $nodeOutputs,
  NodeBitValue,
} from "@/entities/simulationEntities";
import { CircuitElementId } from "@/entities/utils";
import { GateType } from "@/visualizationEngine/gate/Gate";

const and = (a: NodeBitValue, b: NodeBitValue) => a && b;
const or = (a: NodeBitValue, b: NodeBitValue) => a || b;
const not = (a: NodeBitValue) => (~a & 1) as NodeBitValue;
const nand = (a: NodeBitValue, b: NodeBitValue) => not(and(a, b));
const nor = (a: NodeBitValue, b: NodeBitValue) => not(or(a, b));
const xor = (a: NodeBitValue, b: NodeBitValue) => (a ^ b) as NodeBitValue;
const xnor = (a: NodeBitValue, b: NodeBitValue) => not(xor(a, b));

// TODO: make `createParticle` method for particle entities
const gateEvaluatorFns = {
  and: (id: CircuitElementId) => {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputs.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputs.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating" as const;
    } else {
      return and(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  or: (id: CircuitElementId) => {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputs.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputs.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating" as const;
    } else {
      return or(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  not: (id: CircuitElementId) => {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput = nodeInputs[0];
    const nodeInput_Output = $nodeOutputs.adaptDerivative(
      nodeInput as CircuitElementId,
    )!();
    if (nodeInput_Output === "floating") {
      return "floating" as const;
    } else {
      return not(nodeInput_Output);
    }
  },
  nand: (id: CircuitElementId) => {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputs.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputs.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating" as const;
    } else {
      return nand(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  nor: (id: CircuitElementId) => {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputs.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputs.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating" as const;
    } else {
      return nor(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  xor: (id: CircuitElementId) => {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputs.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputs.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating" as const;
    } else {
      return xor(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  xnor: (id: CircuitElementId) => {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputs.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputs.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating" as const;
    } else {
      return xnor(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
};

export default function evaluate_Gate(
  gateType: GateType,
  id: CircuitElementId,
) {
  return gateEvaluatorFns[gateType](id);
}
