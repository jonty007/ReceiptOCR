// store all the status/constant mappings in this file

export const UserStatus = {
  PAYMENT_PENDING: 'Payment Pending',
  VERIFICATION_PENDING: 'verification pending',
  ACTIVE: 'active',
  DISABLED: 'disabled'
};

export const UserTypes = {
  INDIVIDUAL: 'individual',
  ORGANIZATION_ADMIN: 'organization_admin',
  ORGANIZATION_USER: 'organization_user'
};

export const NotificationDevicePlatform = {
  IOS: 'iOS',
  ANDROID: 'Android'
};

export const PlanTypes = {
  MONTHLY: 'MONTHLY'
};

export const StorageType = {
  LOCAL: 'LOCAL',
  AZURE: 'AZURE',
  S3: 'S3'
};
