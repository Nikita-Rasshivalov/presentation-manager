import { UserRole } from "@prisma/client";
import { prisma } from "../prisma/prisma.ts";

export class PresentationService {
  async getAll() {
    return prisma.presentation.findMany({
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(title: string, nickname: string) {
    const presentation = await prisma.presentation.create({ data: { title } });
    const session = await prisma.userSession.create({
      data: {
        nickname,
        role: UserRole.CREATOR,
        presentationId: presentation.id,
      },
    });
    return { presentation, session };
  }

  async getById(id: string) {
    return prisma.presentation.findUnique({
      where: { id },
      include: {
        slides: {
          include: { elements: true },
          orderBy: { slideIndex: "asc" },
        },
        sessions: true,
      },
    });
  }

  async join(presentationId: string, nickname: string) {
    return prisma.userSession.create({
      data: { nickname, presentationId, role: UserRole.VIEWER },
    });
  }

  async addSlide(presentationId: string) {
    const maxSlide = await prisma.slide.findFirst({
      where: { presentationId },
      orderBy: { slideIndex: "desc" },
    });
    const newIndex = maxSlide ? maxSlide.slideIndex + 1 : 0;
    return prisma.slide.create({
      data: { presentationId, slideIndex: newIndex },
    });
  }

  async removeSlide(slideId: string) {
    await prisma.slideElement.deleteMany({ where: { slideId } });
    await prisma.slide.delete({ where: { id: slideId } });
  }

  async checkUserRole(presentationId: string, nickname: string) {
    const session = await prisma.userSession.findFirst({
      where: { presentationId, nickname },
    });
    return session?.role ?? null;
  }

  async getSlides(presentationId: string) {
    return prisma.slide.findMany({
      where: { presentationId },
      orderBy: { slideIndex: "asc" },
    });
  }

  async getSlideById(presentationId: string, slideId: string) {
    return prisma.slide.findFirst({
      where: { id: slideId, presentationId },
      include: { elements: true },
    });
  }

  async getSlideByIdRaw(slideId: string) {
    return prisma.slide.findUnique({
      where: { id: slideId },
      select: { id: true, presentationId: true },
    });
  }
}
