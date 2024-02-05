import {
  $nodeInputsCollection,
  $nodeOutputsCollection,
  NodeBitValue,
  NodeOutput,
} from "@/stateEntities/simulationData";
import { CircuitElementId } from "@/stateEntities/utils";
import { CircuitElementType } from "@/stateEntities/generalCircuitElementData";

const and = (a: NodeBitValue, b: NodeBitValue) => a && b;
const or = (a: NodeBitValue, b: NodeBitValue) => a || b;
const not = (a: NodeBitValue) => (~a & 1) as NodeBitValue;
const nand = (a: NodeBitValue, b: NodeBitValue) => not(and(a, b));
const nor = (a: NodeBitValue, b: NodeBitValue) => not(or(a, b));
const xor = (a: NodeBitValue, b: NodeBitValue) => (a ^ b) as NodeBitValue;
const xnor = (a: NodeBitValue, b: NodeBitValue) => not(xor(a, b));

export const circuitElementEvaluatorFns: Record<
  CircuitElementType,
  (id: CircuitElementId) => NodeOutput
> = {
  and(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating";
    } else {
      return and(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  or(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating";
    } else {
      return or(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  not(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput = nodeInputs[0];
    const nodeInput_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput as CircuitElementId,
    )!();
    if (nodeInput_Output === "floating") {
      return "floating";
    } else {
      return not(nodeInput_Output);
    }
  },
  nand(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating";
    } else {
      return nand(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  nor(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating";
    } else {
      return nor(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  xor(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating";
    } else {
      return xor(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  xnor(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput_1 = nodeInputs[0];
    const nodeInput_2 = nodeInputs[1];
    const nodeInput_1_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_1 as CircuitElementId,
    )!();
    const nodeInput_2_Output = $nodeOutputsCollection.adaptDerivative(
      nodeInput_2 as CircuitElementId,
    )!();
    if (
      nodeInput_1_Output === "floating" ||
      nodeInput_2_Output === "floating"
    ) {
      return "floating";
    } else {
      return xnor(nodeInput_1_Output, nodeInput_2_Output);
    }
  },
  input(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();

    return nodeInputs[0] as NodeBitValue;
  },
  output() {
    return "floating";
  },
  conductor(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    for (let i = 0; i < nodeInputs.length; i++) {
      const nodeInput = nodeInputs[i];
      const nodeInput_Output = $nodeOutputsCollection.adaptDerivative(
        nodeInput as CircuitElementId,
      )!();
      if (nodeInput_Output === 0 || nodeInput_Output === 1) {
        return nodeInput_Output;
      }
    }

    return "floating";
  },
  blackBox(id: CircuitElementId) {
    // TODO: implement black box stuff
    return id as NodeOutput;
  },
};
