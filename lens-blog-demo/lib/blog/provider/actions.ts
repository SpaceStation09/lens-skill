import { AccountState, LensInteractionError } from "@/lib/blog/types";

export function fallbackAccountState(walletAddress?: string): AccountState {
  return walletAddress ? "wallet_connected_unauthed" : "disconnected";
}

export function normalizeHandle(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase();
}

export function toUiMessage(error: unknown): string {
  if (error instanceof LensInteractionError) {
    switch (error.code) {
      case "USERNAME_TAKEN":
        return "用户名已被占用，请换一个";
      case "NAMESPACE_UNSUPPORTED_FLOW":
        return "当前环境暂不支持直接创建 Lens 用户名，请切换流程或网络后重试";
      case "INVALID_INPUT":
        return "输入格式不正确，请检查后重试";
      case "UNAUTHENTICATED":
      case "SESSION_EXPIRED":
        return "当前未登录 Lens，请先完成登录";
      case "USER_REJECTED_SIGNATURE":
        return "你取消了签名，请重试";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) return error.message;
  return "发生未知错误，请稍后再试";
}
