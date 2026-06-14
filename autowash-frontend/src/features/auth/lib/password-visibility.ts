export type PasswordVisibilityState = {
  actionLabel: "Show password" | "Hide password";
  inputType: "password" | "text";
};

export function getPasswordVisibilityState(isVisible: boolean): PasswordVisibilityState {
  return isVisible
    ? {
        actionLabel: "Hide password",
        inputType: "text",
      }
    : {
        actionLabel: "Show password",
        inputType: "password",
      };
}
