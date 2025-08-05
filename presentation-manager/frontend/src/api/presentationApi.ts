import axiosInstance from "../services/axiosInstance";
import {
  Slide,
  PresentationSummary,
  CreatePresentationResponse,
} from "../types/types";

export const fetchPresentations = async (): Promise<PresentationSummary[]> => {
  const res = await axiosInstance.get<PresentationSummary[]>(
    "/api/presentations"
  );
  return res.data;
};

export const createPresentation = async (
  title: string,
  nickname: string,
  socketId: string
): Promise<CreatePresentationResponse> => {
  const res = await axiosInstance.post<CreatePresentationResponse>(
    "/api/presentations",
    { title, nickname, socketId }
  );
  return res.data;
};

export const joinPresentation = async (
  presentationId: string,
  nickname: string,
  socketId: string
): Promise<void> => {
  await axiosInstance.post(`/api/presentations/${presentationId}/join`, {
    nickname,
    socketId,
  });
};

export const addSlide = async (
  presentationId: string,
  slideName: string,
  nickname: string
): Promise<Slide> => {
  const res = await axiosInstance.post<Slide>(
    `/api/presentations/${presentationId}/slides`,
    { name: slideName, nickname }
  );
  return res.data;
};

export const removeSlide = async (
  slideId: string,
  nickname: string
): Promise<void> => {
  await axiosInstance.delete(`/api/presentations/slides/${slideId}`, {
    params: { nickname },
  });
};
