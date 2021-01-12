const Joi = require("joi");
const mongoose = require("mongoose");
const publisher = require("./util/axios");

//mongoDB model definition
const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 25,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid objectId provided for {PATH}",
      },
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
          return value && value.length > 0 && value.length <= 3;
        },
        message: "Model input dimensions must be provided.",
      },
    },
    layers: {
      type: [mongoose.Schema.Types.ObjectId],
      validate: {
        validator: function (values) {
          if (!values.length) return false;
          for (const id of values)
            if (!mongoose.Types.ObjectId.isValid(id)) return false;
          return true;
        },
        message: "Invalid {PATH} objectIds provided.",
      },
    },
  },
  { timestamps: true }
);

//modelSchema publish sends request to Flask API
modelSchema.methods.publish = publisher;

const Model = mongoose.model("Model", modelSchema);

//JOI validation for requests
function validateModel(model) {
  const schema = Joi.object({
    name: Joi.string().alphanum().trim().min(5).max(25).required(),
    numLayers: Joi.number().integer().max(10).min(1).positive().required(),
    inputShape: Joi.array().min(1).max(3).required(),
    layers: Joi.array()
      .min(1)
      .required()
      .custom((value, helper) => {
        for (const id of value)
          if (!mongoose.Types.ObjectId.isValid(id))
            throw new Error("of invalid objectIds in layers array.");
        return value;
      }),
    _id: Joi.any().forbidden(),
  });
  return schema.validate(model);
}

module.exports.modelSchema = modelSchema;
module.exports.Model = Model;
module.exports.validate = validateModel;
