const Joi = require("joi");
const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 25,
    trim: true,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
  numLayers: {
    type: Number,
    required: true,
    max: 10,
  },
  inputShape: {
    type: [Number],
    validate: {
      validator: function (value) {
        return value && value.length > 0;
      },
      message: "Model input dimensions must be provided.",
    },
  },
});
const Model = mongoose.model("Model", modelSchema);

function validateModel(model) {
  const schema = Joi.object({
    name: Joi.string().alphanum().trim().min(5).max(25).required(),
    numLayers: Joi.number().integer().max(10).min(1).positive().required(),
    inputShape: Joi.array().min(1).required(),
  });
  return schema.validate(model);
}

module.exports.modelSchema = modelSchema;
module.exports.Model = Model;
module.exports.validate = validateModel;
