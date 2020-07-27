const { spawn } = require("child_process");
const python = spawn("python", ["./python-keras/index.py"]);

setTimeout(function () {
  console.log("boo");
}, 1000);
var uint8arrayToString = function (data) {
  return String.fromCharCode.apply(null, data);
};
python.stdout.on("data", function (data) {
  console.log(uint8arrayToString(data));
});

python.stderr.on("data", function (data) {
  console.log(uint8arrayToString(data));
});

python.stdout.on("end", function () {
  console.log("program ended");
});

python.stdin.write(JSON.stringify([1, 2, 3, "something", "other"]));
python.stdin.end();
