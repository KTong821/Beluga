const express = require("express");
const router = express.Router();
const { Model, validate } = require("../schemas/model");
const { User } = require("../schemas/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Transaction = require("mongoose-transactions");
const validateObjId = require("../middleware/validateObjectId");

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  let models = await Model.find({ _id: { $in: user.models } }).sort("name");
  for (var i = 0; i < models.length; i++) {
    if (!models[i].owner.equals(user._id)) models.splice(i, 1);
  }
  res.send(models);
});

router.get("/:id", auth, validateObjId, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.models.some((id) => id.equals(req.params.id)))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");
  const model = await Model.findById(req.params.id);
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");
  if (!model.owner.equals(user._id))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");
  res.send(model);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  const model = {
    name: req.body.name,
    owner: user._id,
    numLayers: req.body.numLayers,
    inputShape: req.body.inputShape,
    layers: req.body.layers,
  };
  const transaction = new Transaction();
  try {
    const model_id = transaction.insert("Model", model);
    user.models.push(model_id);
    transaction.update("User", user._id, user, { new: true });
    const final = await transaction.run();
  } catch (err) {
    console.error(err);
    const rollbackObj = await transaction.rollback().catch(console.error);
    transaction.clean();
  }
  res.send(model);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const model = await Model.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      numLayers: req.body.numLayers,
      inputShape: req.body.inputShape,
    },
    { new: true }
  );
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");

  res.send(model);
});

router.delete("/:id", auth, async (req, res) => {
  const model = await Model.findByIdAndRemove(req.params.id);
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");
  res.send(model);
});

module.exports = router;
