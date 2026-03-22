// src/pages/homePage/homePage.tsx
import { useEffect, useMemo, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { listCoursesFn } from "../../store/slices/courses/listCourse";
import { getCompletedLessonsFn } from "../../store/lessonProggress/getCompletedProggress";

import type { AppDispatch, RootState } from "../../store/store";
import SectionSkeleton from "./ectionSkeleton";

// Lazy-loaded components
const PopularCourses = lazy(() => import("./PopularCourses"));
const FAQ = lazy(() => import("./FAQ"));

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const coursesState = useSelector((s: RootState) => s.listCoursesSlice);
  const userState = useSelector((state: RootState) => state.WhoAmiSlice);
  const userId = useSelector(
    (state: RootState) => state.loginSlice.data?.user?.id
  );
  const user = userState.data?.user;
  const enrollments = user?.enrollements;
  const courses = coursesState.data?.courses || [];
  const completedLessonsState = useSelector(
    (state: RootState) => state.getCompletedLessonsSlice
  );

  useEffect(() => {
    dispatch(listCoursesFn({}));
    if (userId) {
      dispatch(getCompletedLessonsFn(userId));
    }
  }, [dispatch, userId]);

  const navigateToCourse = (id: number) => {
    navigate(`/courses/${id}`);
  };

  const totalLessons = useMemo(
    () =>
      courses.map((course) => ({
        courseId: course.id,
        lessonsCount: course.lesson?.length || 18,
      })),
    [courses]
  );

  return (
    <div className="w-screen xl:w-full min-h-screen bg-gray-50 dark:bg-[#091025] dark:text-gray-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24 max-w-full bg-gradient-to-tr from-indigo-600/10 to-transparent">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
                Kusoo dhawoow{" "}
                <span className="text-green-600 dark:text-indigo-400">
                  FaceTeacher
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl">
                Application kan waxaad ka heli kartaa aqoonta dugsiga
                hoose-dhaxe ee manhajka jamuuriyadda somaliland.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 rounded-full bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-4 rounded-full border-2 border-green-600 text-green-600 font-semibold shadow-sm hover:bg-green-600/20 dark:border-green-700 dark:text-green-700 dark:hover:bg-green-700/20 transition-all duration-300"
              >
                Browse Courses
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/hero.jpeg"
                alt="Learning illustration"
                className="w-full max-w-lg h-auto rounded-2xl  object-cover transform  transition-transform duration-500"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning Section */}
      {enrollments && enrollments.length > 0 && (
        <section className="mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Continue Your Course
            </h2>
            <button
              onClick={() => navigate("/courses")}
              className="text-green-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {enrollments
              .filter((c) => c.is_enrolled && c.status === "COMPLETED")
              .slice(-2) // take last 2 enrolled courses
              .map((c) => {
                const courseTotalLessons =
                  totalLessons.find((t) => t.courseId === c.courseId)
                    ?.lessonsCount || 0;
                const completedCount =
                  completedLessonsState.data?.completed?.filter(
                    (lesson) => lesson.courseId === c.courseId
                  ).length || 0;
                const progressPercent =
                  courseTotalLessons > 0
                    ? (completedCount / courseTotalLessons) * 100
                    : 0;

                return (
                  <motion.div
                    key={c.id}
                    whileHover={{ y: -2 }}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                      <img
                        src={c.course.course_img}
                        alt={c.course.title || "Course"}
                        className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg object-cover shadow-md flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1 sm:flex-none">
                        <h4 className="text-base sm:text-lg truncate font-medium text-gray-900 dark:text-gray-100">
                          {c.course.title.length > 50
                            ? c.course.title.slice(0, 50) + "..."
                            : c.course.title || "Untitled Course"}
                        </h4>
                        <div className="mt-1 sm:mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 w-full overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {progressPercent.toFixed()}% Complete
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigateToCourse(c.courseId)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full font-medium shadow-sm sm:shadow-md transition-colors duration-300 text-sm sm:text-base"
                    >
                      Continue
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </motion.div>
                );
              })}
          </div>
        </section>
      )}

      {/* Popular Courses */}
      <Suspense fallback={<SectionSkeleton />}>
        <PopularCourses />
      </Suspense>

      {/* FAQ */}
      <Suspense fallback={<SectionSkeleton />}>
        <FAQ />
      </Suspense>
    </div>
  );
}
