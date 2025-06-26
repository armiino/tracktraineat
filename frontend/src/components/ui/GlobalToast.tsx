import { Toaster, toast } from "react-hot-toast";

export function GlobalToast() {
  return <Toaster position="bottom-center" reverseOrder={false} />;
}
export const showSuccess = (msg: string) => toast.success(msg);
export const showError = (msg: string) => toast.error(msg);
export const showInfo = (msg: string) => toast(msg);
