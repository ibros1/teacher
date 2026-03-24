import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

import { getOneCourseFn } from "../../store/slices/courses/getOneCourse";

import type { AppDispatch, RootState } from "../../store/store";
import {
  ChevronDown,
  Lock,
  Star,
  Clock,
  BookOpen,
  User,
  Bookmark,
  Play,
  ArrowLeft,
  Check,
  Video as VideoIcon,
} from "lucide-react";

import EnrolleCourseDetail from "./enrollCourseDetail";
import { listEnrollementsFn } from "../../store/slices/enrollments/listEnrollements";
import CourseDetailPageSkeleton from "../../components/ui/courseDetail";
import { Player, Video, DefaultUi } from "@vime/react";
import "@vime/core/themes/default.css";
import {
  Dialog,
  DialogContent,
} from "../../components/ui/dialog";
import { BASE_API_URL } from "../../constants/base_url";

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

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

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: courseData, loading } = useSelector(
    (state: RootState) => state.getOneCourseSlice
  );

  const userData = useSelector(
    (state: RootState) => state.WhoAmiSlice.data?.user
  );

  useEffect(() => {
    dispatch(listEnrollementsFn({}));
  }, [dispatch]);

  const course = courseData?.course;
  const enrollements = useSelector(
    (state: RootState) => state.listEnrollementsSlice.data?.enrollemnets
  );



  const [expanded, setExpanded] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("content");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewVideo, setSelectedPreviewVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (courseId) dispatch(getOneCourseFn(+courseId));
  }, [dispatch, courseId]);
  const enrollementsLoading = useSelector(
    (state: RootState) => state.listEnrollementsSlice.loading
  );

  if (loading || enrollementsLoading) {
    return <CourseDetailPageSkeleton />;
  }

  if (!course)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#091025] p-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-10 max-w-md text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-green-600" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Course Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-all"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );

  const toggleChapter = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (expanded.length === course.chapters.length) {
      setExpanded([]);
    } else {
      setExpanded(course.chapters.map((ch) => ch.id));
    }
  };

  const userEnrollment = enrollements?.find(
    (enrl) =>
      enrl.userId === userData?.id &&
      enrl.courseId === course.id
  );

  const isCompleted = userEnrollment?.is_enrolled === true && userEnrollment?.status?.toUpperCase() === "COMPLETED";
  const isPending = userEnrollment && ["PENDING", "IN_PROGRESS", "PROCESSING"].includes(userEnrollment.status?.toUpperCase() || "");
  const isFailed = userEnrollment && ["FAILED", "CANCELLED"].includes(userEnrollment.status?.toUpperCase() || "");
  const isEnrolled = userEnrollment?.is_enrolled === true;

  const firstLesson = course.lesson.map((lesson) => lesson.id[0]);

  return (
    <div className="bg-gray-50 dark:bg-[#091025] min-h-screen text-gray-800 dark:text-gray-200">
      {/* Floating Action Buttons */}
      <div className="fixed top-6 left-6 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <ArrowLeft size={18} /> Back
        </motion.button>
      </div>

      <div className="fixed top-6 right-6 z-20 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-3 rounded-lg shadow-sm transition-all ${
            isBookmarked
              ? "bg-yellow-100 text-yellow-600"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
        </motion.button>
      </div>

      {/* Banner Section with Course Cover Image */}
      <div className="relative w-full overflow-hidden">
        {/* Course Cover Image */}
        {course.course_img && (
          <div className="absolute inset-0 z-0 w-full h-[500px]">
            <img
              src={`${course.cover_img}`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 lg:px-8 py-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-3xl text-white">
              <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 text-green-600 dark:text-green-600 px-4 py-2 rounded-full text-sm mb-5 shadow-sm border border-green-600 dark:border-gray-700">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < 4 ? "currentColor" : "none"}
                      className="text-green-600"
                    />
                  ))}
                  <span className="ml-2 font-medium">4.8 (1,245 reviews)</span>
                </div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-white dark:text-white leading-tight mb-4"
              >
                {course.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-white dark:text-gray-300 max-w-3xl mb-8"
              >
                {course.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <User size={18} />
                  <span>{course.users.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <Clock size={18} />
                  <span>12.5 hours</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <BookOpen size={18} />
                  <span>{course.lesson.length} lessons</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Play size={20} fill="currentColor" />
                  Watch Preview
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full md:w-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full md:w-80">
                <div 
                  className="relative h-[180px] cursor-pointer group"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <img
                    src={`${course.course_img}`}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="text-green-600 ml-1" size={24} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Watch Preview
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${Number(course.price_dlr || 0).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ${(Number(course.price_dlr || 0) * 1.2).toFixed(2)}
                    </span>
                  </div>

                  {isCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-green-600 rounded-md text-white px-6 py-3  font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                      onClick={() =>
                        navigate(
                          `/my-courses/continue/${course.id}/${firstLesson}`
                        )
                      }
                    >
                      <Play size={20} /> Continue Learning
                    </motion.button>
                  ) : isPending ? (
                    <div className="w-full bg-yellow-500 rounded-md text-white px-6 py-3 font-medium opacity-80 flex items-center justify-center gap-2 cursor-not-allowed">
                      <Clock size={20} /> Payment Pending
                    </div>
                  ) : (
                    <div className="mb-4">
                      {isFailed && (
                        <p className="text-red-500 text-sm font-medium mb-3 text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-md">
                          Previous payment failed. Please try again.
                        </p>
                      )}
                      <EnrolleCourseDetail course={course} />
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Duration:
                      </span>
                      <span className="font-medium dark:text-gray-200">
                        12.5 hours
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Lessons:
                      </span>
                      <span className="font-medium dark:text-gray-200">
                        Seasons
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Level:
                      </span>
                      <span className="font-medium dark:text-gray-200">
                        Information
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Language:
                      </span>
                      <span className="font-medium dark:text-gray-200">
                        Sensitia
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Certificate:
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        Yes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Course Features */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Course Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-600 mb-2">
                    12.5 hours
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Duration
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-600 mb-2">
                    Seasons
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Lessons
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-600 mb-2">
                    Information
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-600 mb-2">
                    Yes
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Certificate
                  </div>
                </div>
              </div>
            </div>
            {/* Course Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-6 py-4 font-medium text-sm transition-all relative flex-shrink-0 ${
                      activeTab === "content"
                        ? "text-green-600 dark:text-green-600"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Course Content
                    {activeTab === "content" && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 dark:bg-green-600"
                        layoutId="tabIndicator"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("instructor")}
                    className={`px-6 py-4 font-medium text-sm transition-all relative flex-shrink-0 ${
                      activeTab === "instructor"
                        ? "text-green-600 dark:text-green-600"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Instructor
                    {activeTab === "instructor" && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 dark:bg-green-600"
                        layoutId="tabIndicator"
                      />
                    )}
                  </button>
                </nav>
              </div>

              <div className="p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "content" && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Course Content
                          </h3>
                          <button
                            onClick={toggleAll}
                            className="text-sm font-medium text-green-600 dark:text-green-600 hover:text-green-700 dark:hover:text-green-700 transition"
                          >
                            {expanded.length === course.chapters.length
                              ? "Collapse All"
                              : "Expand All"}
                          </button>
                        </div>

                        <div className="space-y-4">
                          {course.chapters.map((chapter, idx) => {
                            const lessons = course.lesson.filter(
                              (l) => l.chapterId === chapter.id
                            );
                            const isOpen = expanded.includes(chapter.id);

                            return (
                              <motion.div
                                key={chapter.id}
                                className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <button
                                  onClick={() => toggleChapter(chapter.id)}
                                  className="w-full px-6 py-4 flex justify-between items-center text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                  <div className="flex items-center gap-4 font-medium text-gray-900 dark:text-white">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold">
                                      {idx + 1}
                                    </div>
                                    <div className="text-left">
                                      <span className="text-lg">
                                        {chapter.chapterTitle}
                                      </span>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {lessons.length} lessons
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <ChevronDown
                                      className={`w-6 h-6 transition-transform text-gray-400 ${
                                        isOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  </div>
                                </button>

                                {isOpen && (
                                  <motion.ul
                                    className="px-6 pb-6 space-y-3"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {lessons.map((lesson, i) => (
                                      <motion.li
                                        key={lesson.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                          !isEnrolled && lesson.is_preview
                                            ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 shadow-sm"
                                            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-none hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700"
                                        }`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                      >
                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30">
                                          <VideoIcon
                                            size={20}
                                            className="text-green-600 dark:text-green-400"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">
                                              {lesson.title}
                                            </p>
                                            {!isEnrolled && lesson.is_preview && (
                                              <Badge className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-5 px-2 uppercase font-bold tracking-tighter">
                                                Free Preview
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            10:48
                                          </p>
                                        </div>
                                        <div>
                                          {isEnrolled || lesson.is_preview ? (
                                            <Play
                                              size={20}
                                              className="text-green-600 dark:text-green-400 cursor-pointer hover:scale-110 transition-transform"
                                              onClick={(e) => {
                                                if (!isEnrolled && lesson.is_preview) {
                                                  e.stopPropagation();
                                                  setSelectedPreviewVideo({
                                                    url: lesson.video_url,
                                                    title: lesson.title,
                                                  });
                                                  setIsPreviewOpen(true);
                                                }
                                              }}
                                            />
                                          ) : (
                                            <Lock
                                              size={18}
                                              className="text-gray-400"
                                            />
                                          )}
                                        </div>
                                      </motion.li>
                                    ))}
                                  </motion.ul>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeTab === "description" && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                          Course Description
                        </h3>
                        <div className="space-y-6">
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            This comprehensive course is designed to take you
                            from beginner to advanced level in building
                            AI-powered SaaS applications with Next.js,
                            TypeScript, Prisma & OpenAI. From foundational
                            concepts to advanced techniques.
                          </p>

                          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              What You'll Learn
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <Check
                                    size={14}
                                    className="text-green-600 dark:text-green-400"
                                  />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300">
                                  Build AI SaaS applications from scratch
                                </span>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <Check
                                    size={14}
                                    className="text-green-600 dark:text-green-400"
                                  />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300">
                                  Integrate OpenAI APIs effectively
                                </span>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <Check
                                    size={14}
                                    className="text-green-600 dark:text-green-400"
                                  />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300">
                                  Advanced data handling with Prisma
                                </span>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <Check
                                    size={14}
                                    className="text-green-600 dark:text-green-400"
                                  />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300">
                                  TypeScript best practices
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              Course Curriculum
                            </h4>
                            <ul className="space-y-4">
                              <li className="flex items-start gap-3">
                                <div className="text-green-600 dark:text-green-400 font-bold">
                                  1.00000
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    Project Setup
                                  </h5>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                    <span className="mr-4">$23</span>
                                    <span>Shadow Count Course</span>
                                  </div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="text-green-600 dark:text-green-400 font-bold">
                                  2.00000
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    Authentication
                                  </h5>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-col">
                                    <div>Setting Up Next/use - 4.29</div>
                                    <div>Setting Up Google Console - 10.93</div>
                                    <div>Using Stream Adapter - 3.73</div>
                                    <div>Setting up Micropilot - 14.24</div>
                                    <div>
                                      Getting User Information from the Client -
                                      10.99
                                    </div>
                                    <div>
                                      Getting User Information from the Server -
                                      4.25
                                    </div>
                                    <div>
                                      Getting the Current User's Store - 10.99
                                    </div>
                                  </div>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="text-green-600 dark:text-green-400 font-bold">
                                  8.00000
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    Designing The Main Layout
                                  </h5>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-col">
                                    <div>Designing The Main Layout - 10:48</div>
                                    <div>Building the sidebar - 14.09</div>
                                    <div>Share Sidebar Links - 10.67</div>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "instructor" && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                          About the Instructor
                        </h3>
                        <div className="flex flex-col lg:flex-row gap-8">
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                              <img
                                src={
                                  course.users.profilePhoto
                                    ? `${course.users.profilePhoto}`
                                    : "/default-avatar.png"
                                }
                                alt={course.users.full_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              {course.users.full_name}
                            </h4>
                            <p className="text-green-600 dark:text-green-400 mb-6">
                              Senior Developer & Educator
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                              {course.users.full_name} is a passionate educator
                              with over 10 years of industry experience. They
                              have taught thousands of students worldwide and
                              focus on creating practical, real-world learning
                              experiences that bridge the gap between theory and
                              practice.
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={18}
                                    fill={i < 4 ? "currentColor" : "none"}
                                    className="text-amber-400"
                                  />
                                ))}
                                <span className="ml-2 text-gray-600 dark:text-gray-400">
                                  4.8/5
                                </span>
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">
                                12K+ Students
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">
                                8 Courses
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog 
        open={isPreviewOpen} 
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) setSelectedPreviewVideo(null);
        }}
      >
        <DialogContent className="max-w-[70rem] w-[95vw] p-0 bg-white dark:bg-[#0f172a] overflow-hidden border-none shadow-2xl rounded-3xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex flex-col lg:flex-row h-full max-h-[85vh] lg:max-h-[90vh]">
            {/* Main Video Area */}
            <div className="flex-none lg:flex-1 bg-black flex flex-col relative group">
              <div className="aspect-video w-full flex items-center justify-center">
                {(selectedPreviewVideo?.url || course.preview_course_url) ? (
                  getYouTubeId(selectedPreviewVideo?.url || course.preview_course_url) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        selectedPreviewVideo?.url || course.preview_course_url
                      )}?rel=0&showinfo=0&modestbranding=1&controls=1&autoplay=1`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title="Video preview"
                    />
                  ) : (
                    <Player controls theme="dark">
                      <Video>
                        <source
                          data-src={formatVideoUrl(selectedPreviewVideo?.url || course.preview_course_url)}
                          type="video/mp4"
                        />
                      </Video>
                      <DefaultUi />
                    </Player>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-white flex-col gap-4">
                    <VideoIcon size={64} className="text-gray-600 animate-pulse" />
                    <p className="text-lg font-medium text-gray-400">No preview video available</p>
                  </div>
                )}
              </div>
              
              {/* Overlay for Title when hovering video */}
              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <h3 className="text-white font-bold text-xl">
                   {selectedPreviewVideo ? selectedPreviewVideo.title : course.title}
                </h3>
              </div>
            </div>

            {/* Sidebar / Info Area */}
            <div className="w-full lg:w-[320px] bg-white dark:bg-[#0f172a] border-l border-gray-100 dark:border-gray-800 flex flex-col">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <VideoIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {selectedPreviewVideo ? "Lesson Preview" : "Course Preview"}
                    </h4>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {selectedPreviewVideo ? selectedPreviewVideo.title : course.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 italic">
                  {selectedPreviewVideo ? "Watch this lesson for free to see if this course is right for you." : course.description}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-2">Preview Sessions</h5>
                <div className="space-y-2">
                   {/* Course Overview Option */}
                   <button 
                    onClick={() => setSelectedPreviewVideo(null)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      !selectedPreviewVideo 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40" 
                        : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                   >
                      <div className="flex items-center gap-3">
                         {selectedPreviewVideo ? <Play size={14} className="text-gray-400" /> : <Play size={14} className="text-green-600" />}
                         <span className={`text-sm font-medium ${!selectedPreviewVideo ? "text-green-700 dark:text-green-400 font-bold" : "text-gray-600 dark:text-gray-400"}`}>
                           Course Overview
                         </span>
                      </div>
                   </button>
                   
                   {/* Map through other preview lessons */}
                   {course.lesson.filter(l => l.is_preview).map((l) => (
                      <button 
                        key={l.id}
                        onClick={() => setSelectedPreviewVideo({ url: l.video_url, title: l.title })}
                        className={`w-full text-left p-3 rounded-xl transition-all border group ${
                          selectedPreviewVideo?.url === l.video_url
                            ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40" 
                            : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            {selectedPreviewVideo?.url === l.video_url ? (
                              <Play size={14} className="text-green-600" />
                            ) : (
                              <Play size={14} className="text-gray-400 group-hover:text-green-600" />
                            )}
                            <span className={`text-sm font-medium truncate ${
                              selectedPreviewVideo?.url === l.video_url 
                                ? "text-green-700 dark:text-green-400 font-bold" 
                                : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}>
                              {l.title}
                            </span>
                         </div>
                      </button>
                   ))}
                </div>
              </div>

              {!isEnrolled && (
                <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                  <Button 
                    onClick={() => navigate(`/courses/enrol/${course.id}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 font-bold text-lg shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Start Learning
                  </Button>
                  <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-tighter">
                    Full Course Access • {course.lesson.length} Lessons
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;
