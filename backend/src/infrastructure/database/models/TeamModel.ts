import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
    name: {type: String, required: true},
    teamLeadId: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    members: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    createdAt: {type: Date, default: Date.now},
    
});

export const TeamModel =   mongoose.model('Team', TeamSchema);