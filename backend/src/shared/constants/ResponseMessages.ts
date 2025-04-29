export const MESSAGES = {

  AUTH: {
    SIGNUP_SUCCESS: "User registered successfully.",
    SIGNUP_FAILED: "Failed to register user.",
    LOGIN_SUCCESS: "User logged in successfully.",
    LOGIN_FAILED: "Failed to log in.",
    INVALID_CREDENTIALS: "Invalid credentials.",
    USER_NOT_FOUND: "User not found.",
    USER_BLOCKED: "User is blocked.",
    PASSWORD_MISMATCH: "Incorrect password.",
    PASSWORD_RESET_SUCCESS: "Password reset successfully.",
    PASSWORD_RESET_FAILED: "Failed to reset password.",
    OTP_SENT: "OTP sent successfully.",
    OTP_VERIFIED: "OTP verified successfully.",
    VERIFICATION_FAILED: "OTP verification failed",
    OTP_RESEND: "OTP resent successfully.",
    OTP_INVALID: "Invalid OTP",
    REFRESH_TOKEN_SUCCESS: "Refresh token generated successfully.",
    REFRESH_TOKEN_FAILED: "Failed to generate refresh token.",
    MISSING_REFRESH_TOKEN: "Refresh token is missing.",
    LOGOUT_SUCCESS: "User logged out successfully",
    GOOGLE_AUTH_SUCCESS: "Google authentication successful.",
    GOOGLE_AUTH_FAILED: "Google authentication failed.",
    EMAIL_AND_OTP_REQUIRED: "Email and OTP are required.",
    INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token.",
    INVALID_OR_EXPIRED_OTP: "Invalid or expired OTP.",
    RESET_PASSWORD_SUCCESS: "Password reset successfully.",
    EMAIL_REQUIRED: "Email is required.",
    TOKEN_REQUIRED: "Token is required",
    INVALID_TOKEN: "Invalid token",
    RESET_LINK_SENT: "Password reset link sent successfully",
  },

  CHAT: {
    CHAT_NOT_FOUND: "Chat not found.",
    MESSAGE_SENT: "Message sent successfully.",
    MESSAGE_FAILED: "Failed to send message.",
    INVALID_CHAT_ID: "Invalid chat ID.",
    USER_NOT_AUTHENTICATED: "User not authenticated.",
  },


  NOTIFICATION: {
    NOTIFICATION_FETCHED: "Notifications fetched successfully.",
    NOTIFICATION_MARKED_AS_READ: "Notification marked as read.",
    NOTIFICATIONS_MARKED_AS_READ: "All notifications marked as read.",
    NOTIFICATIONID_REQUIRED: "Notification ID is required.",
    INVALID_NOTIFICATION_ID: "Invalid notification ID.",
  },


  PROJECT: {
    PROJECT_CREATED: "Project created successfully.",
    PROJECT_UPDATED: "Project updated successfully.",
    PROJECT_DELETED: "Project deleted successfully.",
    PROJECT_NOT_FOUND: "Project not found.",
    INVALID_PROJECT_ID: "Invalid project ID.",
  },


  TASK: {
    TASK_CREATED: "Task created successfully.",
    TASK_UPDATED: "Task updated successfully.",
    TASK_DELETED: "Task deleted successfully.",
    TASK_NOT_FOUND: "Task not found.",
    INVALID_TASK_ID: "Invalid task ID.",
    SUBTASK_CREATED: "Subtask created successfully.",
    SUBTASK_UPDATED: "Subtask updated successfully.",
    SUBTASK_DELETED: "Subtask deleted successfully.",
    SUBTASK_NOT_FOUND: "Subtask not found.",
  },


  TEAM: {
    TEAM_CREATED: "Team created successfully.",
    TEAM_UPDATED: "Team updated successfully.",
    TEAM_DELETED: "Team deleted successfully.",
    TEAM_NOT_FOUND: "Team not found.",
    INVALID_TEAM_ID: "Invalid team ID.",
  },


  USER: {
    USER_FETCHED: "User fetched successfully.",
    USER_UPDATED: "User updated successfully.",
    USER_BLOCKED: "User blocked successfully.",
    USER_UNBLOCKED: "User unblocked successfully.",
    USER_NOT_FOUND: "User not found.",
    INVALID_USER_ID: "Invalid user ID.",
    USERID_REQUIRED: "User ID is required.",
    USER_ALREADY_EXISTS: "User already exists.",
    INVALID_TOKEN_OR_USER_DATA_NOT_FOUND: "Invalid token or user data not found",
    USER_DOES_NOT_HAVE_PASSWORD : 'User does not have a password. Please use another authentication method.',
    USER_DOES_NOT_EXIST : 'User does not exist. Please sign up first.',
  },


  GENERAL: {
    REQUIRED_FIELDS: "Name, email, and password are required.",
    INTERNAL_SERVER_ERROR: "Internal server error.",
    BAD_REQUEST: "Bad request.",
    UNAUTHORIZED: "Unauthorized access.",
    FORBIDDEN: "Forbidden access.",
    NOT_FOUND: "Resource not found.",
    SUCCESS: "Operation successful.",
    FAILED: "Operation failed.",
  },

  DATE: {
    END_DATE_BEFORE_START_DATE: "End date must be after start date.",
  },

  SUBSCRIPTION: {
    SUBSCRIPTION_CREATED: "Subscription created successfully.",
    SUBSCRIPTION_UPDATED: "Subscription updated successfully.",
    SUBSCRIPTION_DELETED: "Subscription deleted successfully.",
    SUBSCRIPTION_NOT_FOUND: "Subscription not found.",
    INVALID_SUBSCRIPTION_ID: "Invalid subscription ID.",
    
  },
};