import { create } from "zustand";
import { Presentation, UserRole } from "../types/types";

interface PresentationState {
  presentation: Presentation | null;
  currentSlideIndex: number;
  nickname: string;
  role: UserRole | null;
  setPresentation: (presentation: Presentation | null) => void;
  setCurrentSlideIndex: (index: number) => void;
  setNickname: (nickname: string) => void;
  setRole: (role: UserRole) => void;
  updateSlideElements: (slideId: string, elements: any[]) => void;
  updateUsers: (users: any[]) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
  presentation: null,
  currentSlideIndex: 0,
  nickname: "",
  role: null,
  setPresentation: (presentation) => set({ presentation }),
  setCurrentSlideIndex: (currentSlideIndex) => set({ currentSlideIndex }),
  setNickname: (nickname) => set({ nickname }),
  setRole: (role) => set({ role }),
  updateSlideElements: (slideId, elements) =>
    set((state) => {
      if (!state.presentation) return {};
      const slides = state.presentation.slides.map((slide) =>
        slide.id === slideId ? { ...slide, elements } : slide
      );
      return { presentation: { ...state.presentation, slides } };
    }),
  updateUsers: (users) =>
    set((state) => {
      if (!state.presentation) return state;
      const currentUsers = state.presentation.users || [];

      const isSameUsers =
        currentUsers.length === users.length &&
        currentUsers.every(
          (u, i) => u.id === users[i].id && u.role === users[i].role
        );

      if (isSameUsers) {
        return state;
      }

      return {
        presentation: {
          ...state.presentation,
          users: [...users],
        },
      };
    }),
}));
