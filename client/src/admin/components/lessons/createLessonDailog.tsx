import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { useForm as useHookForm } from "react-hook-form";
import axios from "axios";
import { BASE_API_URL } from "../../../constants/base_url";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../../components/ui/form";

import CreateChapters from "../chapters/createChapters";

import type { AppDispatch, RootState } from "../../../store/store";
import { listCoursesFn } from "../../../store/slices/courses/listCourse";
import type { Course } from "../../../types/course";
import {
  createlessonFn,
  resetLessonState,
} from "../../../store/slices/lessons/createLesson";
import { listLessonsFn } from "../../../store/slices/lessons/listLessons";
import { Plus } from "lucide-react";
import Spinner from "../../../components/spinner";

interface LessonFormValues {
  course: string;
  chapter: string;
  title: string;
  content: string;
  videoUrl: string;
}

const CreateLessonDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(listCoursesFn({}));
  }, [dispatch]);

  const coursesState = useSelector(
    (state: RootState) => state.listCoursesSlice,
  );
  const loginState = useSelector((state: RootState) => state.loginSlice);
  const createLessonState = useSelector(
    (state: RootState) => state.createLessonSlice,
  );

  const courses = coursesState.data?.courses ?? [];
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const form = useHookForm<LessonFormValues>({
    defaultValues: {
      course: "",
      chapter: "",
      title: "",
      content: "",
      videoUrl: "",
    },
  });

  useEffect(() => {
    if (createLessonState.error) {
      toast.error(createLessonState.error);
    }
    if (createLessonState.data?.isSuccess) {
      toast.success("Lesson created successfully!");
      setIsOpen(false);
      dispatch(listLessonsFn({}));
      form.reset();
      setSelectedCourse(null);
      dispatch(resetLessonState());
    }
  }, [createLessonState, dispatch, form]);

  const onSubmit = async (values: LessonFormValues) => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    
    let finalVideoUrl = values.videoUrl;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("video", selectedFile);

      setIsUploading(true);
      const toastId = toast.loading("Uploading video to Cloudflare R2...");
      try {
        const res = await axios.post(
          `${BASE_API_URL}/courses/lessons/upload-video`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        if (res.data?.isSuccess) {
          finalVideoUrl = res.data.videoUrl;
          toast.success("Video uploaded successfully!", { id: toastId });
        } else {
          toast.error("Upload failed: " + res.data?.message, { id: toastId });
          setIsUploading(false);
          return; // Stop execution if upload fails
        }
      } catch (err: any) {
        toast.error(
          "Upload failed: " + (err.response?.data?.message || err.message),
          { id: toastId },
        );
        setIsUploading(false);
        return; // Stop execution if upload fails
      }
      setIsUploading(false);
    } else if (!finalVideoUrl) {
      toast.error("Please attach a video file first.");
      return;
    }

    dispatch(
      createlessonFn({
        userId: loginState?.data?.user?.id,
        courseId: +selectedCourse.id,
        chapterId: values.chapter,
        title: values.title,
        content: values.content,
        video_url: finalVideoUrl,
        isCompleted: false,
      }),
    );
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Clear any previous URL since we have a new file
      form.setValue("videoUrl", "", { shouldValidate: true });
    } else {
      setSelectedFile(null);
    }
  };

  if (!loginState.data.isSuccess) {
    return <div className="text-red-600 text-xl">Please login first</div>;
  }

  return (
    <div className=" block  md:flex  gap-4">
      <CreateChapters />
      <Button
        className="flex items-center my-4 md:my-0 gap-2 bg-slate-900 hover:bg-slate-800"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4" /> New Lesson
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl dark:bg-[#091025]">
          <DialogHeader>
            <DialogTitle>Create Lesson</DialogTitle>
            <DialogDescription>
              Assign a new lesson to a course and chapter.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Course Select */}
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={(val) => {
                          field.onChange(val);
                          const found = courses.find(
                            (c) => c.id.toString() === val,
                          );
                          setSelectedCourse(found ?? null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                            >
                              {course.title.length > 50
                                ? course.title.slice(0, 50) + "..."
                                : course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Chapter Select */}
              <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        disabled={!selectedCourse}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCourse?.chapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.chapterTitle.length > 40
                                ? ch.chapterTitle.slice(0, 40) + "..."
                                : ch.chapterTitle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter lesson title"
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter lesson content"
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Video URL (Hidden state manager) */}
              <div className="space-y-2">
                <FormLabel>Video Content</FormLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelection}
                    disabled={isUploading}
                    className="cursor-pointer file:cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-primary/90"
                  />
                  {(form.watch("videoUrl") || selectedFile) && (
                    <p className="text-xs text-green-500 font-medium">
                      ✓ Video attached and ready to upload
                    </p>
                  )}
                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Spinner /> Uploading to R2 Storage...
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createLessonState.loading ||
                    isUploading ||
                    (!form.watch("videoUrl") && !selectedFile)
                  }
                  className="disabled:bg-gray-700 bg-slate-900 hover:bg-slate-700 disabled:cursor-not-allowed"
                >
                  {createLessonState.loading || isUploading ? (
                    <Spinner />
                  ) : (
                    "Upload & Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateLessonDialog;
