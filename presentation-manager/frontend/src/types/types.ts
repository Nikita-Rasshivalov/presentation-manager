export enum UserRole {
  CREATOR = "CREATOR",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

export interface RoleResponse {
  role: UserRole;
}

export interface User {
  id: string;
  nickname: string;
  role: UserRole;
}

export interface SlideElement {
  id: string;
  type: "text";
  posX: number;
  posY: number;
  content: string;
}

export interface Slide {
  id: string;
  slideIndex: number;
  elements: SlideElement[];
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  users: User[];
}

export interface PresentationSummary {
  id: string;
  title: string;
  createdAt: string;
}

export interface PresentationState {
  presentation: Presentation | null;
  currentSlideIndex: number;
  nickname: string;
  role: UserRole | null;
  setPresentation: (p: Presentation) => void;
  setCurrentSlideIndex: (index: number) => void;
  setNickname: (name: string) => void;
  setRole: (role: UserRole) => void;
  updateSlideElements: (slideId: string, elements: SlideElement[]) => void;
  updateUsers: (users: User[]) => void;
}

export interface CreatePresentationResponse {
  presentation: PresentationSummary;
  session: {
    nickname: string;
    role: UserRole;
    presentationId: string;
    socketId: string;
  };
}
