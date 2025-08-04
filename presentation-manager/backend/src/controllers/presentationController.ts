import { Request, Response } from "express";
import { PresentationService } from "../services/presentationService.ts";
import { UserRoles } from "../types.ts";
import { prisma } from "../prisma/prisma.ts";

export class PresentationController {
  private presentationService = new PresentationService();

  getAllPresentations = async (req: Request, res: Response) => {
    try {
      const list = await this.presentationService.getAll();
      res.json(list);
    } catch {
      res.status(500).json({ error: "Failed to get presentations" });
    }
  };

  createPresentation = async (req: Request, res: Response) => {
    try {
      const { title, nickname } = req.body;
      const data = await this.presentationService.create(title, nickname);
      res.status(201).json(data);
    } catch {
      res.status(500).json({ error: "Failed to create presentation" });
    }
  };

  getPresentationById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.presentationService.getById(id);
      if (!data)
        return res.status(404).json({ error: "Presentation not found" });
      res.json(data);
    } catch {
      res.status(500).json({ error: "Failed to get presentation" });
    }
  };

  joinPresentation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nickname } = req.body;
      const session = await this.presentationService.join(id, nickname);
      res.status(200).json(session);
    } catch {
      res.status(500).json({ error: "Failed to join presentation" });
    }
  };

  addSlide = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nickname } = req.body;
      const role = await this.presentationService.checkUserRole(id, nickname);
      if (role !== UserRoles.CREATOR)
        return res.status(403).json({ error: "Forbidden" });
      const slide = await this.presentationService.addSlide(id);
      res.status(201).json(slide);
    } catch {
      res.status(500).json({ error: "Failed to add slide" });
    }
  };

  removeSlide = async (req: Request, res: Response) => {
    try {
      const { slideId } = req.params;
      const { nickname } = req.body;

      const slide = await this.presentationService.getSlideByIdRaw(slideId);
      if (!slide) {
        return res.status(404).json({ error: "Slide not found" });
      }

      const presentationId = slide.presentationId;

      const role = await this.presentationService.checkUserRole(
        presentationId,
        nickname
      );

      if (role !== UserRoles.CREATOR) {
        return res
          .status(403)
          .json({ error: "Only CREATOR can delete slides" });
      }

      await this.presentationService.removeSlide(slideId);
      res.status(200).json({
        message: "Slide deleted",
        deletedId: slideId,
        deletedBy: nickname,
      });
    } catch (error) {
      console.error("Failed to remove slide:", error);
      res.status(500).json({ error: "Failed to remove slide" });
    }
  };

  getSlides = async (req: Request, res: Response) => {
    try {
      const { id: presentationId } = req.params;
      const slides = await this.presentationService.getSlides(presentationId);
      res.json(slides);
    } catch {
      res.status(500).json({ error: "Failed to get slides" });
    }
  };

  getSlideById = async (req: Request, res: Response) => {
    try {
      const { id: presentationId, slideId } = req.params;
      const slide = await this.presentationService.getSlideById(
        presentationId,
        slideId
      );
      if (!slide) return res.status(404).json({ error: "Slide not found" });
      res.json(slide);
    } catch {
      res.status(500).json({ error: "Failed to get slide" });
    }
  };

  getMyRole = async (req: Request, res: Response) => {
    const { presentationId, nickname } = req.query;

    if (typeof presentationId !== "string" || typeof nickname !== "string") {
      return res.status(400).json({ error: "Invalid params" });
    }

    const session = await prisma.userSession.findFirst({
      where: { presentationId, nickname },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.status(200).json({ role: session.role });
  };
}
