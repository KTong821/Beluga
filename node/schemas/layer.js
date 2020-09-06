const Joi = require("joi");
const mongoose = require("mongoose");
const defaults = [
  "input",
  "dense",
  "dropout",
  "flatten",
  "maxp2d",
  "gmp2d",
  "conv2d",
  "vgg16",
  "vgg19",
  "resnet50",
  "effnetb0",
];
const layerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 25,
    trim: true,
    validate: {
      validator: function (value) {
        if (this.isCustom) return !defaults.includes(value);
        return defaults.includes(value);
      },
    },
  },
  num: {
    type: Number,
    min: 1,
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
  isInput: {
    type: Boolean,
    required: true,
  },
  inputShape: {
    type: [Number],
    required: function () {
      return this.isInput;
    },
    validate: {
      validator: function (value) {
        if (!this.isInput) return true;
        return value && value.length > 0 && value.length <= 3;
      },
      message:
        "{PATH} must be provided if 'isInput' is true and must have fewer than or equal to 3 dimensions.",
    },
  },
  isCustom: {
    type: Boolean,
    required: true,
    validate: {
      validator: function (value) {
        const a = this.isInput,
          b = value;
        return !(a && b);
      },
      message:
        "Custom input layers not supported. Only one of 'isInput' or 'isCustom' can be true.",
    },
  },
  lambda: {
    //file path
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        if (this.isCustom && !value) return false;
        if (!this.isCustom && value) return false;
        return true;
      },
      message: "{PATH} must be provided only iff 'isCustom' is true",
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
          validator: (value) => {
            return value.length === 0 || value.length === 2;
          },
          message: "{PATH} must be of length 2.",
        },
      },
      pooling: {
        type: [Number],
        validate: {
          validator: (value) => {
            return value.length === 0 || value.length === 2;
          },
          message: "{PATH} must be of length 2.",
        },
      },
      regularizer: {
        type: new mongoose.Schema({
          l1: Boolean,
          l2: Boolean,
          l1_rate: Number,
          l2_rate: Number,
        }),
      },
      include_top: Boolean,
    }),
  },
});

const Layer = mongoose.model("Layer", layerSchema);

function validateLayer(layer) {
  const schema = Joi.object({
    name: Joi.required().when("isCustom", {
      is: true,
      then: Joi.string()
        .alphanum()
        .trim()
        .min(5)
        .max(25)
        .invalid(...defaults),
      otherwise: Joi.string().valid(...defaults),
    }),
    num: Joi.number().positive(),
    isInput: Joi.boolean().required(),
    isCustom: Joi.required().when("isInput", {
      is: true,
      then: Joi.boolean().required().valid(false).messages({
        "any.only":
          "Custom input layers not supported. Only one of 'isInput' or 'isCustom' can be true.",
      }),
      otherwise: Joi.boolean(),
    }),
    inputShape: Joi.when("isInput", {
      is: true,
      then: Joi.array()
        .required()
        .max(3)
        .min(1)
        .message(
          "Because 'isInput' is true, 'inputShape' must have 1 to 3 dimensions."
        ),
      otherwise: Joi.forbidden().messages({
        "any.unknown": "Do not provide 'inputShape' if 'isInput' is false.",
      }),
    }),
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
      regularizer: Joi.object({
        l1: Joi.boolean(),
        l2: Joi.boolean(),
        l1_rate: Joi.number().positive(),
        l2_rate: Joi.number().positive(),
      }),
      include_top: Joi.boolean(),
    }),
  });
  return schema.validate(layer);
}

module.exports.layerSchema = layerSchema;
module.exports.Layer = Layer;
module.exports.validate = validateLayer;
module.exports.defaults = defaults;
