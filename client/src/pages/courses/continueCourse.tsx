import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
  CheckCircle,
  BookOpen,
  X,
  ChevronLeft,
  Circle,
} from "lucide-react";
import { getOneCourseFn } from "../../store/slices/courses/getOneCourse";
import type { RootState, AppDispatch } from "../../store/store";
import { BASE_API_URL } from "../../constants/base_url";
import { toast } from "sonner";

import { getLessonProgressFn } from "../../store/lessonProggress/getLessonProggress";
import { createLessonProgressFn } from "../../store/lessonProggress/makeProgress";
import { getCompletedLessonsFn } from "../../store/lessonProggress/getCompletedProggress";
import ContinueCourseSkeleton from "../../components/ui/continueCourseSkeleton";
import { Player, Video, DefaultUi } from "@vime/react";
import "@vime/core/themes/default.css";

const formatVideoUrl = (url: string) => {
  if (!url) return "";

  try {
    const urlObj = new URL(url);
    urlObj.pathname = urlObj.pathname
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");

    return urlObj.toString();
  } catch {
    const encodedPath = encodeURIComponent(url.trim()).replace(/%2F/g, "/");
    return url.startsWith("http") ? url : `${BASE_API_URL}/${encodedPath}`;
  }
};

const ContinueCourse = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId?: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux selectors
  const { data, loading } = useSelector(
    (state: RootState) => state.getOneCourseSlice
  );
  const userState = useSelector((state: RootState) => state.WhoAmiSlice);
  const loginUserState = useSelector((state: RootState) => state.loginSlice);
  const completeLessonState = useSelector(
    (state: RootState) => state.getCompletedLessonsSlice
  );
  const createProgressState = useSelector(
    (state: RootState) => state.createLessonProgressSlice
  );

  const course = data?.course;
  const user = userState?.data?.user;
  const loginUser = loginUserState.data?.user;

  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(
    lessonId
  );
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "content" | "assignment" | "discussion" | "info"
  >("content");
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const lastAutoExpandedChapterIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const isLg = window.matchMedia("(min-width: 1024px)").matches;
    const isMd = window.matchMedia("(min-width: 768px)").matches;
    if (isLg) {
      setIsSidebarOpen(true);
      setIsSidebarCollapsed(false);
      return;
    }
    setIsSidebarOpen(false);
    setIsSidebarCollapsed(isMd);
  }, []);

  // Sort lessons
  const sortedLessons = useMemo(() => {
    return [...(course?.lesson || [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [course]);

  // Current lesson
  const currentLesson = useMemo(() => {
    return (
      sortedLessons.find((l) => l.id === currentLessonId) || sortedLessons[0]
    );
  }, [sortedLessons, currentLessonId]);

  // Get YouTube ID and video type
  const youtubeId = useMemo(() => {
    const url = currentLesson?.video_url || "";
    if (!url) return "";

    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") return urlObj.pathname.slice(1);
      if (urlObj.hostname.includes("youtube.com"))
        return urlObj.searchParams.get("v") || "";
    } catch {
      return "";
    }
    return "";
  }, [currentLesson?.video_url]);

  // Group chapters
  const chaptersWithLessons = useMemo(() => {
    return (
      course?.chapters.map((chapter) => ({
        ...chapter,
        lessons: sortedLessons.filter(
          (lesson) => lesson.chapterId === chapter.id
        ),
      })) || []
    );
  }, [course, sortedLessons]);

  const totalLessons = sortedLessons.length;
  const completedLessonsCount =
    completeLessonState.data?.completed?.length || 0;

  const progressPercent =
    totalLessons > 0
      ? Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100))
      : 0;

  const completedLessonIds = useMemo(() => {
    return new Set(
      completeLessonState.data?.completed
        ?.filter((item) => item.isCompleted)
        .map((item) => item.lessonId) || []
    );
  }, [completeLessonState]);

  // Load course data
  useEffect(() => {
    if (courseId) dispatch(getOneCourseFn(+courseId));
  }, [dispatch, courseId]);

  // Load completed lessons
  useEffect(() => {
    if (user?.id) {
      dispatch(getCompletedLessonsFn({ userId: user.id, courseId: +courseId! }));
    }
  }, [dispatch, user?.id, courseId]);

  // Update current lesson
  useEffect(() => {
    if (lessonId) {
      setCurrentLessonId(lessonId);
    } else if (sortedLessons.length) {
      setCurrentLessonId(sortedLessons[0].id);
    }
  }, [lessonId, sortedLessons]);

  // Expand current chapter only on initial load
  useEffect(() => {
    const chapterId = currentLesson?.chapterId;
    if (!chapterId) return;
    if (lastAutoExpandedChapterIdRef.current === chapterId) return;

    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev : [...prev, chapterId]
    );
    lastAutoExpandedChapterIdRef.current = chapterId;
  }, [currentLesson?.chapterId]);

  // Fetch lesson progress
  useEffect(() => {
    const fetchLessonProgress = async () => {
      if (!user || !currentLesson?.id) return;
      try {
        const result = await dispatch(
          getLessonProgressFn({ userId: user.id, lessonId: currentLesson.id })
        ).unwrap();
        setLessonCompleted(result?.progress?.isCompleted ?? false);
      } catch {
        setLessonCompleted(false);
      }
    };
    fetchLessonProgress();
  }, [dispatch, user, currentLesson?.id]);

  // Refresh completed lessons
  useEffect(() => {
    if (createProgressState.data.isSuccess && user?.id) {
      dispatch(getCompletedLessonsFn({ userId: user.id, courseId: +courseId! }));
    }
  }, [createProgressState, dispatch, user?.id, courseId]);

  // Mark lesson completed/incomplete
  const completedHandler = async () => {
    if (!user || !currentLesson) return;
    const newStatus = !lessonCompleted;
    try {
      await dispatch(
        createLessonProgressFn({
          userId: user.id,
          courseId: currentLesson.courseId,
          lessonId: currentLesson.id,
          isCompleted: newStatus,
        })
      ).unwrap();
      setLessonCompleted(newStatus);
      await dispatch(
        getLessonProgressFn({ userId: user.id, lessonId: currentLesson.id })
      );
      toast.success(
        newStatus ? "Marked as completed!" : "Marked as incomplete!"
      );
    } catch {
      toast.error("Could not update progress");
    }
  };

  // Navigate to lesson
  const handleLessonClick = (id: string) => {
    setCurrentLessonId(id);
    navigate(`/my-courses/continue/${courseId}/${id}`);
    setIsSidebarOpen(false);
  };

  // Toggle chapter
  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Navigation
  const currentIndex =
    sortedLessons.findIndex((l) => l.id === currentLessonId) ?? 0;
  const prevLesson = sortedLessons[currentIndex - 1];
  const nextLesson = sortedLessons[currentIndex + 1];

  // Early returns
  if (loading || userState.loading)
    return (
      <div className="p-12 text-center">
        <ContinueCourseSkeleton />
      </div>
    );
  if (!course)
    return (
      <div className="p-12 text-center text-green-600">
        Course not found or no lessons available.
      </div>
    );
  if (!currentLesson)
    return (
      <div className="p-12 text-center text-green-600">
        No lessons found. Please contact admin.
      </div>
    );
  if (!loginUser) return <div>Please login first!</div>;

  // Check enrollment
  const isUserEnrolled = user?.enrollements?.some(
    (en) => en.courseId === +courseId! && en.is_enrolled
  );
  if (!isUserEnrolled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You must enroll in this course to access its content.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full font-medium hover:opacity-90 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={
          `fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 ` +
          `transform transition-transform duration-300 ease-in-out ` +
          `${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ` +
          `w-72 md:w-72 lg:translate-x-0 lg:static lg:z-0 ` +
          `${isSidebarCollapsed ? "lg:w-16" : "lg:w-72"}`
        }
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className={isSidebarCollapsed ? "hidden" : "block"}>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
              {course?.title}
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <progress
                value={progressPercent}
                max={100}
                className="w-full h-2 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-green-600 dark:[&::-webkit-progress-value]:bg-green-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500">
                <span>{completedLessonsCount} done</span>
                <span>{totalLessons} total</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden lg:inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                size={18}
                className={
                  "text-slate-700 dark:text-slate-200 transition-transform " +
                  (isSidebarCollapsed ? "rotate-180" : "")
                }
              />
            </button>
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={18} className="text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {chaptersWithLessons?.map((chapter) => {
            const isExpanded = expandedChapters.includes(chapter.id);
            const completedInChapter = chapter.lessons.filter((l) => completedLessonIds.has(l.id)).length;

            return (
              <div key={chapter.id} className="rounded-2xl bg-white dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`chapter-${chapter.id}`}
                  title={isSidebarCollapsed ? chapter.chapterTitle : undefined}
                  className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900">
                      <ChevronRight
                        size={16}
                        className={
                          "text-slate-700 dark:text-slate-200 transition-transform " +
                          (isExpanded ? "rotate-90" : "")
                        }
                      />
                    </span>
                    <div className={isSidebarCollapsed ? "hidden" : "min-w-0"}>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {chapter.chapterTitle}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {chapter.lessons.length} lessons
                      </div>
                    </div>
                  </div>
                  <div className={isSidebarCollapsed ? "hidden" : "block"}>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-full">
                      {completedInChapter}/{chapter.lessons.length}
                    </span>
                  </div>
                </button>

                <div
                  id={`chapter-${chapter.id}`}
                  className={
                    "overflow-hidden transition-all duration-300 " +
                    (isExpanded ? "max-h-screen" : "max-h-0")
                  }
                >
                  <div className="pl-2 pr-1 pb-2 space-y-1">
                    {chapter.lessons.map((lesson) => {
                      const isCompleted = completedLessonIds.has(lesson.id);
                      const isCurrent = lesson.id === currentLessonId;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            handleLessonClick(lesson.id);
                            setIsSidebarOpen(false);
                          }}
                          title={isSidebarCollapsed ? lesson.title : undefined}
                          className={
                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 " +
                            (isCurrent
                              ? "bg-green-50 dark:bg-blue-950/40 text-green-700 dark:text-green-200 border-l-4 border-green-600"
                              : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200")
                          }
                        >
                          <span className="inline-flex w-5 justify-center">
                            {isCompleted ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                            ) : (
                              <Circle size={16} className="text-slate-400" />
                            )}
                          </span>
                          <span className={isSidebarCollapsed ? "hidden" : "min-w-0 flex-1"}>
                            <span className="block text-sm font-medium truncate">
                              {lesson.title}
                            </span>
                          </span>
                          {isCurrent && !isSidebarCollapsed && (
                            <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <ChevronRight size={18} className="text-slate-700 dark:text-slate-200" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/my-courses")}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-green-600 dark:hover:text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg px-2 py-1"
              >
                <ChevronLeft size={16} />
                Back to Dashboard
              </button>
            </div>

            <div className="flex items-center gap-2">
              {lessonCompleted ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 px-4 py-2 text-xs font-semibold">
                  <CheckCircle size={14} />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-semibold">
                  <Circle size={14} />
                  In Progress
                </span>
              )}
            </div>
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            {currentLesson?.video_url ? (
              youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&showinfo=0&modestbranding=1&autohide=1&controls=1&playsinline=1&cc_load_policy=1&iv_load_policy=3`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  title="Lesson video"
                />
              ) : (
                <Player theme="dark">
                  <Video crossOrigin="">
                    <source data-src={formatVideoUrl(currentLesson.video_url)} type="video/mp4" />
                  </Video>
                  <DefaultUi />
                </Player>
              )
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center text-slate-300">
                  <BookOpen size={40} className="mx-auto mb-3" />
                  <p className="text-sm">No video available for this lesson</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => prevLesson && handleLessonClick(prevLesson.id)}
              disabled={!prevLesson}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <ChevronLeft size={16} />
              Previous Lesson
            </button>

            <button
              type="button"
              onClick={completedHandler}
              className={
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500 " +
                (lessonCompleted
                  ? "bg-emerald-600 text-white"
                  : "bg-green-600 text-white")
              }
            >
              {lessonCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
              {lessonCompleted ? "Completed" : "Mark as Complete"}
            </button>

            <button
              type="button"
              onClick={() => nextLesson && handleLessonClick(nextLesson.id)}
              disabled={!nextLesson}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 sm:ml-auto"
            >
              Next Lesson
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-8 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={
                  "px-4 sm:px-6 py-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 " +
                  (activeTab === "content"
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")
                }
              >
                Lesson Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("assignment")}
                className={
                  "px-4 sm:px-6 py-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 " +
                  (activeTab === "assignment"
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")
                }
              >
                Assignment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("discussion")}
                className={
                  "px-4 sm:px-6 py-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 " +
                  (activeTab === "discussion"
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")
                }
              >
                Community Discussion
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={
                  "px-4 sm:px-6 py-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 " +
                  (activeTab === "info"
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")
                }
              >
                Student Info
              </button>
            </div>

            <div className="p-6">
              {activeTab === "content" && (
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {currentLesson?.title}
                  </h1>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-200">
                      {currentLesson?.content || "No content available for this lesson."}
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "assignment" && (
                <div className="py-10 text-center text-slate-600 dark:text-slate-300">
                  Assignment content will appear here.
                </div>
              )}
              {activeTab === "discussion" && (
                <div className="py-10 text-center text-slate-600 dark:text-slate-300">
                  Community discussion will appear here.
                </div>
              )}
              {activeTab === "info" && (
                <div className="py-10 text-center text-slate-600 dark:text-slate-300">
                  Student information will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContinueCourse;
