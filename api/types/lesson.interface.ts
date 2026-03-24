export interface iCreatedLesson {
  userId: number;
  courseId: number;
  chapterId: string;
  title: string;
  content: string;
  isCompleted?: boolean;
  is_preview?: boolean;
  video_url: string;
}

export interface iBulkCreatedLesson {
  userId: number;
  courseId: number;
  chapterId: string;
  lessons: {
    title: string;
    content: string;
    video_url: string;
    is_preview?: boolean;
  }[];
}

export interface iUpdatedLesson {
  id: string;
  courseId: number;
  userId: number;
  title: string;
  content: string;
  chapterId: string;
  isCompleted?: boolean;
  is_preview?: boolean;
  video_url: string;
}
