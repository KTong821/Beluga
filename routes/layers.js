const express = require("express");
const router = express.Router();
const { Layer, validate } = require("../schemas/layer");
// const auth = require("../middleware/auth");
// const admin = require("../middleware/admin");
const validateObjId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
  const layers = await Layer.find().sort("name");
  res.send(layers);
});

router.get("/:id", validateObjId, async (req, res) => {
  const layer = await Layer.findById(req.params.id);
  if (!layer)
    return res.status(404).send("The layer with the given ID does not exist.");

  res.send(layer);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const layer = new Layer({
    name: req.body.name,
    num: req.body.num,
    isInput: req.body.isInput,
    inputShape: req.body.inputShape,
    isCustom: req.body.isCustom,
    options: req.body.options,
  });
  await layer.save();
  res.send(layer);
});

// router.put("/:id", async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   const layer = await Layer.findByIdAndUpdate(
//     req.params.id,
//     {
//       name: req.body.name,
//       numLayers: req.body.numLayers,
//       inputShape: req.body.inputShape,
//     },
//     { new: true }
//   );
//   if (!layer)
//     return res.status(404).send("The layer with the given ID does not exist.");

//   res.send(layer);
// });

// router.delete("/:id", async (req, res) => {
//   const layer = await Layer.findByIdAndRemove(req.params.id);
//   if (!layer)
//     return res.status(404).send("The layer with the given ID does not exist.");
//   res.send(layer);
// });

module.exports = router;
