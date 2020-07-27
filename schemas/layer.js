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
  num: {
    type: Number,
    min: 1,
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
    }),
  },
});

// layerSchema.pre("validate", (next) => {
//   console.log(2);
//   next();
// });
// layerSchema.pre("validate", (next) => {
//   console.log(1);
//   next();
// });
// layerSchema.pre("save", () => {
//   console.log(3);
// });

const Layer = mongoose.model("Layer", layerSchema);

function validateLayer(layer) {
  const schema = Joi.object({
    name: Joi.string().alphanum().trim().min(5).max(25).required(),
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
    }),
  });
  return schema.validate(layer);
}

module.exports.layerSchema = layerSchema;
module.exports.Layer = Layer;
module.exports.validate = validateLayer;
