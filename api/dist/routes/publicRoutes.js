"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicController_1 = require("../controllers/publicController");
const router = (0, express_1.Router)();
router.post('/newsletter', publicController_1.subscribeNewsletter);
router.post('/contact', publicController_1.submitContactForm);
exports.default = router;
