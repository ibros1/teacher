import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { type AppDispatch, type RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { listCoursesFn } from "../../../store/slices/courses/listCourse";
import {
  createChapterFn,
  createBulkChaptersFn, // 👈 Import new thunk
  resetChapterState,
} from "../../../store/slices/chapters/createChapter";
import { listChaptersFn } from "../../../store/slices/chapters/listChapters";
import Spinner from "../../../components/spinner";
import { toast } from "sonner";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

// ✅ Schema like CreateLessonDialog
const formSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  chapters: z.array(
    z.object({
      chapterTitle: z.string().min(3, "Chapter name must be at least 3 characters"),
    })
  ).min(1, "At least one chapter is required"),
});

const CreateChapters = () => {
  const dispatch = useDispatch<AppDispatch>();

  const listCoursesState = useSelector(
    (state: RootState) => state.listCoursesSlice
  );
  const createChapterState = useSelector(
    (state: RootState) => state.createChapterSlice
  );
  const loginState = useSelector((state: RootState) => state.loginSlice);

  const [isCreateChapterDialogOpen, setIsCreateChapterDialogOpen] =
    useState(false);

  const courses = listCoursesState.data?.courses;
  const userId = loginState.data?.user.id;

  useEffect(() => {
    dispatch(listCoursesFn({}));
  }, [dispatch]);

  // ✅ Same pattern as CreateLessonDialog
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      chapters: [{ chapterTitle: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "chapters",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const chapterTitles = values.chapters.map((c) => c.chapterTitle);
    
    if (chapterTitles.length === 1) {
      dispatch(
        createChapterFn({
          userId,
          courseId: Number(values.courseId),
          chapterTitle: chapterTitles[0],
        })
      );
    } else {
      dispatch(
        createBulkChaptersFn({
          userId,
          courseId: Number(values.courseId),
          chapters: chapterTitles,
        })
      );
    }
  };

  useEffect(() => {
    if (createChapterState.error) {
      toast.error(createChapterState.error);
      return;
    }

    if (createChapterState.data?.isSuccess) {
      toast.success(createChapterState.data?.message || "Successfully created!");
      dispatch(resetChapterState());
      setIsCreateChapterDialogOpen(false);
      form.reset({
        courseId: "",
        chapters: [{ chapterTitle: "" }],
      });
      dispatch(listChaptersFn({}));
    }
  }, [createChapterState, dispatch, form]);

  return (
    <div>
      <Button
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800"
        onClick={() => setIsCreateChapterDialogOpen(true)}
      >
        <Plus className="w-4 h-4" /> New Chapter
      </Button>

      <Dialog
        open={isCreateChapterDialogOpen}
        onOpenChange={setIsCreateChapterDialogOpen}
      >
        <DialogContent className="sm:max-w-lg rounded-xl dark:bg-[#091025]">
          <DialogHeader>
            <DialogTitle>Create Chapter</DialogTitle>
            <DialogDescription>
              Assign a new chapter to a course.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Course Select */}
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses?.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={String(course.id)}
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

              {/* Chapters List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Chapters</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ chapterTitle: "" })}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`chapters.${index}.chapterTitle`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={`Chapter ${index + 1} Title`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateChapterDialogOpen(false)}
                  disabled={createChapterState.loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createChapterState.loading}
                  className="disabled:bg-gray-700 bg-slate-900 hover:bg-slate-700 disabled:cursor-not-allowed"
                >
                  {createChapterState.loading ? <Spinner /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateChapters;
