import { toast } from "sonner";
import { ApiError } from "@/types/api";
import { AxiosError } from "axios";

export const handleError = (error: unknown, fallbackMessage?: string) => {
  const defaultMessage = "Đã có lỗi xảy ra, vui lòng thử lại sau.";
  let message = fallbackMessage || defaultMessage;

  if (isApiError(error)) {
    // Lỗi đã được transform bởi Axios interceptor → luôn lấy message từ BE
    message = error.message || fallbackMessage || defaultMessage;
  } else if (isAxiosError(error)) {
    // Lỗi Axios chưa qua interceptor → thử lấy từ nhiều vị trí khác nhau
    message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
  console.error("[ErrorHandler]", { message, error });
};

function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === "object" &&
    typeof error.message === "string" &&
    typeof error.status === "number"
  );
}

function isAxiosError(error: any): error is AxiosError<{ message?: string; error?: string; errors?: string[] }> {
  return error && error.isAxiosError === true;
}
