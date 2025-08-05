import { Router } from "express";
import { PresentationController } from "../controllers/presentationController.ts";

const router = Router();
const controller = new PresentationController();

router.get("/", controller.getAllPresentations);
router.post("/", controller.createPresentation);
router.get("/role", controller.getMyRole);
router.get("/:id", controller.getPresentationById);
router.post("/:id/join", controller.joinPresentation);
router.post("/:id/slides", controller.addSlide);
router.delete("/slides/:slideId", controller.removeSlide);
router.get("/:id/slides", controller.getSlides);
router.get("/:id/slides/:slideId", controller.getSlideById);

export default router;
