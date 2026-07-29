import mongoose from "mongoose";

const VeiculoSchema = new mongoose.Schema({
    plate: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    owner: {
        owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
}
    },
    workshop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workshop",
        required: true
    },
    maintenances: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Maintenance"
        }
    ]
})

const MVeiculo = mongoose.model("Veiculo", VeiculoSchema)
export default MVeiculo;