import MVeiculo from "../../db/Veiculo.js";

async function updateVeiculo(id, updateData, options) {
    const updateVeiculo = await MVeiculo.findByIdAndUpdate(id, updateData, options);
    return updateVeiculo;
}

export default updateVeiculo;