const express = require("express");
let router = express.Router();

/* GET digital write status. */
router.get('/digitalwrite', function (req, res, next) {
    res.status(200).json({ digitalwrite: true });
});

/* GET analog write status. */
// 螢幕亮度的調光、LED 連續亮度的調整、喇叭音量大小的控制
router.get('/analogwrite', function (req, res, next) {
    res.status(200).json({ analogwrite: true });
});

/* GET digital read status. */
// click digital button
router.get('/digitalread', function (req, res, next) {
    res.status(200).json({ digitalread: true });
});

/* GET analog read status. */
// read setting json file
router.get('/analogread', function (req, res, next) {
    res.status(200).json({ analogread: true });
});

module.exports = router;
