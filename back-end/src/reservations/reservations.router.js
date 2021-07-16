/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/").get(controller.read).post(controller.create).all(methodNotAllowed);
router.route("/:reservationId").get(controller.readById).put(controller.update).all(methodNotAllowed);
router.route("/:reservationId/status").put(controller.updateStatus).all(methodNotAllowed);

module.exports = router;
