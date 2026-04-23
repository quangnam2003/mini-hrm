import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { handleError } from "@/utils/error-handler";
import { LoginFormValues } from "../types/auth";
import { routes } from "@/constants/routes";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      return res;
    },
    onSuccess: async () => {
      sessionStorage.setItem("showLoginSuccessToast", "true");
      
      // Fetch session to determine role for correct redirection
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const role = session?.user?.role;
      
      const destination = role === "admin" 
        ? routes.employeeManagement 
        : routes.attendance.personal;
        
      router.replace(destination);
    },
    onError: (error) => {
      handleError(error, "Đăng nhập thất bại");
    }
  });
}
