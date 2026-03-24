import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useForm as useHookForm, useFieldArray } from "react-hook-form";
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
  FormMessage,
} from "../../../components/ui/form";

import type { AppDispatch, RootState } from "../../../store/store";
import { listCoursesFn } from "../../../store/slices/courses/listCourse";
import type { Course } from "../../../types/course";
import {
  createBulkLessonFn,
  resetBulkLessonState,
} from "../../../store/slices/lessons/createBulkLesson";
import { listLessonsFn } from "../../../store/slices/lessons/listLessons";
import { Plus, Trash2 } from "lucide-react";
import Spinner from "../../../components/spinner";

interface BulkLessonFormValues {
  course: string;
  chapter: string;
  lessons: {
    title: string;
    content: string;
    videoUrl: string;
    is_preview: boolean;
  }[];
}

const CreateBulkLessonDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(listCoursesFn({}));
  }, [dispatch]);

  const coursesState = useSelector(
    (state: RootState) => state.listCoursesSlice
  );
  const loginState = useSelector((state: RootState) => state.loginSlice);
  const createBulkLessonState = useSelector(
    (state: RootState) => state.createBulkLessonSlice
  );

  const courses = coursesState.data?.courses ?? [];
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const form = useHookForm<BulkLessonFormValues>({
    defaultValues: {
      course: "",
      chapter: "",
      lessons: [
        {
          title: "",
          content: "",
          videoUrl: "",
          is_preview: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lessons",
  });

  useEffect(() => {
    if (createBulkLessonState.error) {
      toast.error(createBulkLessonState.error);
    }
    if (createBulkLessonState.data?.isSuccess) {
      toast.success(createBulkLessonState.data.message);
      setIsOpen(false);
      dispatch(listLessonsFn({}));
      form.reset();
      setSelectedCourse(null);
      dispatch(resetBulkLessonState());
    }
  }, [createBulkLessonState, dispatch, form]);

  // AUTO-CREATE: When all uploads finish, automatically submit
  useEffect(() => {
    // Only auto-submit when:
    // 1. No uploads are in progress
    // 2. We have selected files (meaning uploads happened)
    // 3. All lessons have video URLs (all uploads succeeded)
    // 4. A course and chapter are selected
    const hasFiles = Object.keys(selectedFiles).length > 0;
    const noUploadsInProgress = Object.keys(uploadProgress).length === 0;
    
    if (hasFiles && noUploadsInProgress && selectedCourse) {
      const values = form.getValues();
      const allLessonsReady = values.lessons.every(
        (lesson) => lesson.videoUrl && lesson.title.trim() && lesson.content.trim()
      );
      
      if (allLessonsReady && values.chapter) {
        // Small delay to let the UI show success toasts first
        const timer = setTimeout(() => {
          toast.info("All videos uploaded! Auto-saving lessons...");
          form.handleSubmit(onSubmit)();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [uploadProgress, selectedFiles]);

  const onSubmit = async (values: BulkLessonFormValues) => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    const unUploaded = fields.some((field, index) => !form.getValues(`lessons.${index}.videoUrl`) && selectedFiles[field.id]);
    if (unUploaded || Object.keys(uploadProgress).length > 0) {
        toast.error("Please wait for all videos to finish uploading.");
        return;
    }

    // Final database payload
    dispatch(
      createBulkLessonFn({
        userId: loginState?.data?.user?.id,
        courseId: +selectedCourse.id,
        chapterId: values.chapter,
        lessons: values.lessons.map((lesson) => ({
          title: lesson.title,
          content: lesson.content,
          video_url: lesson.videoUrl,
          is_preview: lesson.is_preview,
        })),
      })
    );
  };

  const handleFileSelection = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldId = fields[index].id;

    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [fieldId]: file }));
      // Clear URL since a new file was chosen locally
      form.setValue(`lessons.${index}.videoUrl`, "", { shouldValidate: true });
      
      // Start upload in background
      setUploadProgress((prev) => ({ ...prev, [fieldId]: 0 }));
      const toastId = toast.loading(`Uploading video for Lesson ${index + 1}...`);
      
      try {
        const formData = new FormData();
        formData.append("video", file);

        const { data: uploadResult } = await axios.post(
            `${BASE_API_URL}/courses/lessons/upload-video`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress((prev) => ({ ...prev, [fieldId]: percentCompleted }));
                },
            }
        );

        if (!uploadResult.isSuccess) throw new Error(uploadResult.message || "Upload failed");

        form.setValue(`lessons.${index}.videoUrl`, uploadResult.videoUrl, { shouldValidate: true });
        toast.success(`Lesson ${index + 1} video uploaded!`, { id: toastId });
      } catch (err: any) {
        toast.error(`Lesson ${index + 1} upload failed!`, { id: toastId });
        console.error(err);
      } finally {
        setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[fieldId];
            return next;
        });
      }

    } else {
      setSelectedFiles((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
      });
      form.setValue(`lessons.${index}.videoUrl`, "");
    }
  };

  const addLesson = () => {
    append({
      title: "",
      content: "",
      videoUrl: "",
      is_preview: false,
    });
  };

  if (!loginState.data.isSuccess) {
    return <div className="text-red-600 text-xl">Please login first</div>;
  }

  return (
    <div className="block md:flex gap-4">
      <Button
        className="flex items-center my-4 md:my-0 gap-2 bg-green-600 hover:bg-green-700"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4" /> Create Multiple Lessons
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl dark:bg-[#091025]">
          <DialogHeader>
            <DialogTitle>Create Multiple Lessons</DialogTitle>
            <DialogDescription>
              Create multiple lessons for a course and chapter at once.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            (c) => c.id.toString() === val
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lessons Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Lessons</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLesson}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Lesson
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Lesson {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Title */}
                    <FormField
                      control={form.control}
                      name={`lessons.${index}.title`}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* is_preview */}
                    <FormField
                      control={form.control}
                      name={`lessons.${index}.is_preview`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">Allow preview</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Content */}
                    <FormField
                      control={form.control}
                      name={`lessons.${index}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter lesson content"
                              rows={3}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Video URL */}
                    <div className="space-y-2">
                      <FormLabel>Video Content</FormLabel>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileSelection(index, e)}
                          disabled={!!uploadProgress[field.id] || createBulkLessonState.loading}
                          className="cursor-pointer file:cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-primary/90"
                        />
                        {(form.watch(`lessons.${index}.videoUrl`) || selectedFiles[field.id]) && (
                          <p className="text-xs text-green-500 font-medium">✓ Video attached and ready for upload</p>
                        )}
                        {uploadProgress[field.id] !== undefined && (
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Spinner /> Uploading to R2: {uploadProgress[field.id]}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                <div 
                                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress[field.id]}%` }}
                                ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                  disabled={createBulkLessonState.loading || Object.keys(uploadProgress).length > 0}
                  className="disabled:bg-gray-700 bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed"
                >
                  {createBulkLessonState.loading || Object.keys(uploadProgress).length > 0 ? (
                    <Spinner />
                  ) : (
                    `Upload & Create (${fields.length})`
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

export default CreateBulkLessonDialog;
