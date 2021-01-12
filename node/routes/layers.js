const express = require("express");
const router = express.Router();
const { Layer, validate, defaults } = require("../schemas/layer");
const { User } = require("../schemas/user");
const Transaction = require("mongoose-transactions");
const auth = require("../middleware/auth");
const winston = require("winston");
const validateObjId = require("../middleware/validateObjectId");
const mongoose = require("mongoose");
const _ = require("lodash");
const fs = require("fs-extra");
const upload = require("./multer_config");

//send list of supported layer types
router.get("/", async (req, res) => {
  res.send(defaults);
});

//id parameter must either be valid MongoDB _id field or "custom"
function validateParam(req, res, next) {
  if (
    !mongoose.Types.ObjectId.isValid(req.params.id) &&
    req.params.id !== "custom"
  )
    return res.status(404).send("Invalid ID");
  next();
}

//retrieve configured layer previously created by user
router.get("/:id", auth, validateParam, async (req, res) => {
  //return list of layers only if "custom" type specified
  if (req.params.id === "custom") {
    const user = await User.findById(req.user._id);
    let layers = await Layer.find({
      _id: { $in: user.layers },
      isCustom: true,
    }).sort("name");

    return res.send(layers);
  }

  //match ownership
  const user = await User.findById(req.user._id);
  if (!user.layers.some((id) => id.equals(req.params.id)))
    return res
      .status(400)
      .send("The user does not own the layer with the given ID.");
  const layer = await Layer.findById(req.params.id);
  if (!layer)
    return res.status(404).send("The layer with the given ID does not exist.");
  if (!layer.owner.equals(user._id))
    return res
      .status(400)
      .send("The user does not own the layer with the given ID.");
  res.send(layer);
});

//create layer
router.post("/", auth, upload.single("module"), async (req, res) => {
  //check for file submission
  if (req.file_invalid)
    return res.status(400).send("Invalid file type for custom layer.");
  if (req.file_unexpected)
    res.append("warning", "'isCustom' false; files rejected.");

  const { error } = validate(req.body);
  if (error) {
    if (req.file)
      //delete submission if layer body has issues
      await fs.unlink(`./uploads/${req.user._id}/${req.file.originalname}`);
    return res.status(400).send(error.details[0].message);
  }

  if (req.body.isCustom && !req.file)
    return res.status(400).send("Missing custom layer .py file.");

  const user = await User.findById(req.user._id);
  const layer = {
    name: req.body.name,
    num: req.body.num,
    owner: req.user._id,
    isInput: req.body.isInput,
    inputShape: req.body.inputShape,
    isCustom: req.body.isCustom,
    lambda: req.file_path,
    options: req.body.options,
  };

  //transaction prevents orphan layers
  const transaction = new Transaction();
  try {
    const layer_id = transaction.insert("Layer", layer);
    user.layers.push(layer_id);
    transaction.update("User", user._id, user);
    const final = await transaction.run();
  } catch (err) {
    winston.error(err.message, err);
    const rollbackObj = await transaction.rollback().catch(console.error);
    transaction.clean();
    return res.status(500).send("Internal Server Error");
  }
  //return created layer, except for lambda file path
  res.send(_.omit(layer, ["lambda"]));
});

//delete layer by id
router.delete("/:id", auth, validateObjId, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.layers.some((id) => id.equals(req.params.id)))
    return res
      .status(400)
      .send("The user does not own the layer with the given ID.");
  const layer = await Layer.findById(req.params.id);
  if (!layer)
    return res.status(404).send("The layer with the given ID does not exist.");
  if (!layer.owner.equals(user._id))
    return res
      .status(400)
      .send("The user does not own the layer with the given ID.");
  await Layer.remove({ _id: req.params.id });
});

module.exports = router;
