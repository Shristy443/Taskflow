const express = require("express");

const {
  getUsers,
  searchUsers,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.get("/search",searchUsers);

module.exports = router;