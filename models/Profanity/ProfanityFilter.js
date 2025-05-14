const mongoose = require("mongoose");

const profanityFilterSchema = new mongoose.Schema({
    bannedWords: [String],
});

const ProfanityFilter = mongoose.model("ProfanityFilter", profanityFilterSchema);
module.exports = ProfanityFilter;