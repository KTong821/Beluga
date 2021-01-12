const multer = require("multer");

//multer multi-part form data configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `./uploads/${req.user._id}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
    req.file_path = `${dir}/${file.originalname}`;
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const filter = function (req, file, cb) {
  if (req.body.layer) {
    //multi-part form data sends only strings, so JSON stringify used to preserve types
    req.body = JSON.parse(req.body.layer);
  }

  if (req.body.isCustom) {
    if (file.originalname.slice(-3) !== ".py") {
      //ensure only python file type
      req.file_invalid = true;
      cb(null, false);
    } else cb(null, true);
  } else {
    req.file_unexpected = true;
    cb(null, false);
  }
};
export default multer({ storage: storage, fileFilter: filter });
