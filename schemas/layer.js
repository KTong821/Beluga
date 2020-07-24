const Joi = require("joi");
const mongoose = require("mongoose");

const layerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 25,
    trim: true,
  },
  num: Number,
  isInput: {
    type: Boolean,
    required: true,
  },
  inputShape: {
    type: [Number],
    required: this.isInput,
    // validate: {
    //   validator: (value) => {
    //     console.log(this.isInput);
    //     return value && value.length > 0 && value.length <= 3;
    //   },
    //   message:
    //     "Input layer shape must be provided and have fewer than or equal to 3 dimensions.",
    // },
  },
  isCustom: {
    type: Boolean,
    required: () => {
      console.log(this);
      console.log("under required: " + this.isInput);
      return true;
    },
    validate: {
      validator: (value) => {
        console.log("isInput: " + this.isInput + " " + value);
        return true;
      },
      message:
        "Custom input layers not supported. Only one of 'isInput' or 'isCustom' can be true.",
    },
  },
  options: {
    type: new mongoose.Schema({
      activation: {
        type: String,
        enum: ["relu", "sigmoid", "softmax", "tanh", "selu", "elu"],
      },
      rate: Number,
      padding: {
        type: String,
        enum: ["valid", "same"],
      },
      strides: {
        type: [Number],
        validate: {
          validator: tuple2D,
          message: "{PATH} must be of length 2.",
        },
      },
      pooling: {
        type: [Number],
        validate: {
          validator: tuple2D,
          message: "{PATH} must be of length 2.",
        },
      },
    }),
  },
});

layerSchema.pre("validate", (next) => {
  console.log(2);
  next();
});
layerSchema.pre("validate", (next) => {
  console.log(1);
  next();
});
layerSchema.pre("save", () => {
  console.log(3);
});

function tuple2D(value) {
  return value.length === 2;
}

const Layer = mongoose.model("Layer", layerSchema);

function validateLayer(layer) {
  const schema = Joi.object({
    name: Joi.string().alphanum().trim().min(5).max(25).required(),
    num: Joi.number().positive(),
    isInput: Joi.boolean().required(),
    isCustom: Joi.boolean()
      .when("isInput", {
        is: Joi.boolean().truthy(),
        then: Joi.valid(false),
        otherwise: Joi.required(),
      })
      .error((err) => {
        err.message = "something or other";
        console.log("Error type: " + err);
      }),
    // inputShape: Joi.when("isInput", {
    //   is: true,
    //   then: Joi.any().required(),
    // }),
    options: Joi.object({
      activation: Joi.string().valid(
        "relu",
        "sigmoid",
        "softmax",
        "tanh",
        "selu",
        "elu"
      ),
      rate: Joi.number().greater(0).less(1),
      padding: Joi.string().valid("valid", "same"),
      strides: Joi.array().length(2),
      pooling: Joi.array().length(2),
    }),
  });
  return schema.validate(layer);
}

module.exports.layerSchema = layerSchema;
module.exports.Layer = Layer;
module.exports.validate = validateLayer;
