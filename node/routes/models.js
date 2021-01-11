const express = require("express");
const router = express.Router();
const { Model, validate } = require("../schemas/model");
const { User } = require("../schemas/user");
const auth = require("../middleware/auth");
const winston = require("winston");
const Transaction = require("mongoose-transactions");
const validateObjId = require("../middleware/validateObjectId");

//returns list of user's models
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  let models = await Model.find({ _id: { $in: user.models } }).sort("name");

  //double checking removes all models where owner labels do not match
  for (var i = 0; i < models.length; i++) {
    if (!models[i].owner.equals(user._id)) models.splice(i, 1);
  }
  res.send(models);
});

//returns model specified by id
router.get("/:id", auth, validateObjId, async (req, res) => {
  const user = await User.findById(req.user._id);

  //check for matching owner label
  if (!user.models.some((id) => id.equals(req.params.id)))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");
  const model = await Model.findById(req.params.id);
  //check for model existence
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");

  //check for matching owner label
  if (!model.owner.equals(user._id))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");
  res.send(model);
});

//creates model and list under user "models" property
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

  //transaction prevents orphan models
  const transaction = new Transaction();
  try {
    const model_id = transaction.insert("Model", model);
    user.models.push(model_id);
    transaction.update("User", user._id, user);
    const final = await transaction.run();
  } catch (err) {
    winston.error(err.message, err);
    const rollbackObj = await transaction.rollback().catch(console.error);
    transaction.clean();
    return res.status(500).send("Internal Server Error");
  }
  res.send(model);
});

//publishes model of specified id
//does NOT alter model (see PUT endpoint below)
router.post("/:id", auth, async (req, res) => {
  // model publishing medium specifications
  if (!req.body.type && typeof req.body.type !== "string")
    return res.status(400).send("Model return type required as string.");
  if (!["docker", "h5", "script", "notebook"].includes(req.body.type))
    return res
      .status(400)
      .send("Only 'docker', 'h5', 'script', 'notebook' return types allowed.");
  //ownership & existence checks
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

  //http request to Flask API
  const flask_res = await model.publish(req.body.type);
  if (flask_res.status == 200) return res.send(flask_res.data);
  else if (flask_res.status == 500) {
    return res.status(500).end();
  } else return res.status(400).send("__ERROR MESSAGE__");
  //TODO: clean up error logic after finalizing python
});

//update model
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check ownership & existence
  const user = await User.findById(req.user._id);
  if (!user.models.some((id) => id.equals(req.params.id)))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");

  let model = await Model.findById(req.params.id);
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");
  if (!model.owner.equals(user._id))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");

  //update db
  model = await Model.findOneAndUpdate(
    { _id: model._id },
    {
      $set: {
        name: req.body.name,
        numLayers: req.body.numLayers,
        inputShape: req.body.inputShape,
        layers: req.body.layers,
      },
    },
    { new: true }
  );

  res.send(model);
});

//delete model
router.delete("/:id", auth, async (req, res) => {
  //ownership & existence checks
  const user = await User.findById(req.user._id);
  if (!user.models.some((id) => id.equals(req.params.id)))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");

  let model = await Model.findById(req.params.id);
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");
  if (!model.owner.equals(user._id))
    return res
      .status(400)
      .send("The user does not own the model with the given ID.");

  await Model.remove({ _id: req.params.id });
  res.send(model);
});

module.exports = router;
