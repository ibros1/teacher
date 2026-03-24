import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../../../components/ui/dialog";
import { AlertDialogHeader } from "../../../components/ui/alert-dialog";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { toast } from "sonner";
import { Plus, Users, BookOpen } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../../store/store";
import { createEnrollmentFn, resetCreateEnrollState } from "../../../store/slices/enrollments/createEnrollment";
import { createPaymentFn, resetCreatePaymentState } from "../../../store/slices/payments/createPayment";
import { listUsersFn } from "../../../store/slices/auth/user/getAllUsers";
import { listCoursesFn } from "../../../store/slices/courses/listCourse";
import { listEnrollementsFn } from "../../../store/slices/enrollments/listEnrollements";

const CreateEnrollment = () => {
  const dispatch = useDispatch<AppDispatch>();
  const createEnrollState = useSelector((state: RootState) => state.createEnrollementSlice);
  const createPaymentState = useSelector((state: RootState) => state.createPaymentSlice);
  const usersState = useSelector((state: RootState) => state.listUsersSlice);
  const coursesState = useSelector((state: RootState) => state.listCoursesSlice);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();
  const [status, setStatus] = useState("IN_PROGRESS");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ZAAD");
  const [currency, setCurrency] = useState("SOS");

  // Fetch users and courses when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      dispatch(listUsersFn());
      dispatch(listCoursesFn({}));
    }
  }, [dispatch, isDialogOpen]);

  // Toast handling for create status
  useEffect(() => {
    if (createEnrollState.loading || createPaymentState.loading) {
      toast.dismiss();
      toast.loading("Creating enrollment...");
    } else if (createEnrollState.error || createPaymentState.error) {
      toast.dismiss();
      toast.error(createEnrollState.error || createPaymentState.error);
    } else if (createEnrollState.data.isSuccess) {
      toast.dismiss();
      toast.success("Successfully created enrollment");
      dispatch(listEnrollementsFn({}));
      dispatch(resetCreateEnrollState());
      dispatch(resetCreatePaymentState());
      setIsDialogOpen(false);
      // Reset form
      setSelectedUserId(undefined);
      setSelectedCourseId(undefined);
      setStatus("IN_PROGRESS");
      setIsEnrolled(false);
      setPhoneNumber("");
      setPaymentMethod("ZAAD");
      setCurrency("SOS");
    }
  }, [createEnrollState, createPaymentState, dispatch]);

  // Get selected course details
  const selectedCourse = coursesState.data?.courses?.find(
    (course: any) => course.id === selectedCourseId
  );

  // Get selected user details
  const selectedUser = usersState.data?.users?.find(
    (user: any) => user.id === selectedUserId
  );

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedCourseId || !phoneNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // First create payment
      const paymentPayload = {
        userId: selectedUserId,
        courseId: selectedCourseId,
        phoneNumber,
        amount: currency === "USD" 
          ? parseFloat(selectedCourse?.price_dlr?.toString() || "0")
          : parseFloat(selectedCourse?.price_shl?.replace(/[^0-9.]/g, '') || "0"),
        currency,
        payment_method: paymentMethod,
        status: isEnrolled ? "PAID" : "PENDING",
        isEnrolled,
      };

      const paymentResult = await dispatch(createPaymentFn(paymentPayload) as any);

      if (paymentResult.payload?.isSuccess) {
        // Then create enrollment with the payment ID
        const enrollmentPayload = {
          userId: selectedUserId,
          courseId: selectedCourseId,
          status,
          paymentId: paymentResult.payload.payment.id,
          isEnrolled,
        };

        await dispatch(createEnrollmentFn(enrollmentPayload) as any);
      }
    } catch (error) {
      console.error("Error creating enrollment:", error);
      toast.error("Failed to create enrollment");
    }
  };

  return (
    <div>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Enrollment
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <AlertDialogHeader>
              <DialogTitle>Create New Enrollment</DialogTitle>
              <DialogDescription>
                Enroll a user in a course and create the associated payment record.
              </DialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-4 py-4">
              {/* User Selection */}
              <div className="grid gap-2">
                <Label htmlFor="user">Select User *</Label>
                <Select value={selectedUserId?.toString()} onValueChange={(value) => setSelectedUserId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user">
                      {selectedUser && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {selectedUser.full_name}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {usersState.data?.users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <img
                            src={user.profilePhoto}
                            alt={user.full_name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          {user.full_name} ({user.email})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Selection */}
              <div className="grid gap-2">
                <Label htmlFor="course">Select Course *</Label>
                <Select value={selectedCourseId?.toString()} onValueChange={(value) => setSelectedCourseId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course">
                      {selectedCourse && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {selectedCourse.title}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {coursesState.data?.courses?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        <div className="flex items-center gap-2">
                          <img
                            src={course.course_img}
                            alt={course.title}
                            className="w-6 h-6 rounded object-cover"
                          />
                          {course.title} - ${course.price_dlr}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZAAD">ZAAD</SelectItem>
                    <SelectItem value="E_DAHAB">E-DAHAB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SOS">SOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Enroll Immediately */}
              <div className="flex items-center gap-3">
                <Switch
                  id="isEnrolled"
                  checked={isEnrolled}
                  onCheckedChange={(checked) => setIsEnrolled(checked as boolean)}
                />
                <Label htmlFor="isEnrolled">Enroll Immediately</Label>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">Enrollment Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="FAILED">FAILED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Price Display */}
              {selectedCourse && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm font-medium">Course Price:</p>
                  <p className="text-lg font-bold text-green-600">
                    {currency === "USD" 
                      ? `$${selectedCourse.price_dlr} USD`
                      : `${selectedCourse.price_shl} SOS`
                    }
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({currency === "USD" ? `${selectedCourse.price_shl} SOS` : `$${selectedCourse.price_dlr} USD`})
                    </span>
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={createEnrollState.loading || createPaymentState.loading}
              >
                {createEnrollState.loading || createPaymentState.loading ? "Creating..." : "Create Enrollment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateEnrollment;
