const express = require("express");
const router = express.Router();
const { Model, validate } = require("../schemas/model");
// const auth = require("../middleware/auth");
// const admin = require("../middleware/admin");
const validateObjId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
  const models = await Model.find().sort("name");
  res.send(models);
});

router.get("/:id", validateObjId, async (req, res) => {
  const model = await Model.findById(req.params.id);
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");

  res.send(model);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const model = new Model({
    name: req.body.name,
    numLayers: req.body.numLayers,
    inputShape: req.body.inputShape,
  });
  await model.save();
  res.send(model);
});

router.put("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
  const model = await Model.findByIdAndRemove(req.params.id);
  if (!model)
    return res.status(404).send("The model with the given ID does not exist.");
  res.send(model);
});

module.exports = router;
