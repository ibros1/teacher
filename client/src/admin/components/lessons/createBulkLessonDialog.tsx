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
  }[];
}

const CreateBulkLessonDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadingIndices, setUploadingIndices] = useState<number[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
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

  const onSubmit = async (values: BulkLessonFormValues) => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    // Process valid lessons
    const finalLessons = [];
    const newUploadingIndices: number[] = [];

    // Validation pass
    for (let i = 0; i < values.lessons.length; i++) {
        const lesson = values.lessons[i];
        const hasFile = !!selectedFiles[i];
        const hasUrl = !!lesson.videoUrl;

        if (lesson.title.trim() && lesson.content.trim() && (hasFile || hasUrl)) {
            finalLessons.push({ index: i, ...lesson });
            if (hasFile) newUploadingIndices.push(i);
        }
    }

    if (finalLessons.length === 0) {
      toast.error("Please add at least one complete lesson (must have video)");
      return;
    }

    setUploadingIndices(newUploadingIndices);
    let uploadFailed = false;

    // Upload files sequentially or in parallel
    for (const validLesson of finalLessons) {
      const idx = validLesson.index;
      const fileContext = selectedFiles[idx];

      if (fileContext) {
        const formData = new FormData();
        formData.append("video", fileContext);
        const toastId = toast.loading(`Uploading video for Lesson ${idx + 1}...`);
        
        try {
            const res = await axios.post(`${BASE_API_URL}/courses/lessons/upload-video`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data?.isSuccess) {
                validLesson.videoUrl = res.data.videoUrl;
                toast.success(`Lesson ${idx + 1} video uploaded successfully!`, { id: toastId });
            } else {
                toast.error(`Lesson ${idx + 1} upload failed: ` + res.data?.message, { id: toastId });
                uploadFailed = true;
                break;
            }
        } catch (err: any) {
            toast.error(`Lesson ${idx + 1} upload failed: ` + (err.response?.data?.message || err.message), { id: toastId });
            uploadFailed = true;
            break;
        }
      }
    }

    setUploadingIndices([]);

    if (uploadFailed) {
        toast.error("Bulk creation aborted due to upload failure.");
        return;
    }

    // Final database payload
    dispatch(
      createBulkLessonFn({
        userId: loginState?.data?.user?.id,
        courseId: +selectedCourse.id,
        chapterId: values.chapter,
        lessons: finalLessons.map((lesson) => ({
          title: lesson.title,
          content: lesson.content,
          video_url: lesson.videoUrl,
        })),
      })
    );
  };

  const handleFileSelection = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [index]: file }));
      // Clear URL since a new file was chosen locally
      form.setValue(`lessons.${index}.videoUrl`, "", { shouldValidate: true });
    } else {
      setSelectedFiles((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
      });
    }
  };

  const addLesson = () => {
    append({
      title: "",
      content: "",
      videoUrl: "",
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
                          disabled={uploadingIndices.includes(index) || createBulkLessonState.loading}
                          className="cursor-pointer file:cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-primary/90"
                        />
                        {(form.watch(`lessons.${index}.videoUrl`) || selectedFiles[index]) && (
                          <p className="text-xs text-green-500 font-medium">✓ Video attached and ready for upload</p>
                        )}
                        {uploadingIndices.includes(index) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Spinner /> Uploading to R2 Storage...
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
                  disabled={createBulkLessonState.loading || uploadingIndices.length > 0}
                  className="disabled:bg-gray-700 bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed"
                >
                  {createBulkLessonState.loading || uploadingIndices.length > 0 ? (
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
