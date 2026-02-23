import { TFunction } from "i18next";

export const getFirebaseErrorMessage = (error: any, t: TFunction): string => {
  const errorCode = error?.code;

  const errorMap: Record<string, string> = {
    "auth/user-not-found": t("auth.userNotFound"),
    "auth/wrong-password": t("auth.wrongPassword"),
    "auth/too-many-requests": t("auth.tooManyRequests"),
    "auth/email-already-in-use": t("auth.emailInUse"),
    "auth/weak-password": t("auth.weakPassword"),
    "auth/invalid-email": t("auth.invalidEmail"),
    "auth/invalid-credential": t("auth.invalidCredential"),
    "auth/account-exists-with-different-credential": t("auth.accountExists"),
    "auth/popup-closed-by-user": t("auth.popupClosed"),
    "auth/cancelled-popup-request": t("auth.popupCancelled"),
    "auth/network-request-failed": t("auth.networkError"),
  };

  return errorMap[errorCode] || t("auth.genericError");
};
