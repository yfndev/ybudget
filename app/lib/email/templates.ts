export const BREVO_TEMPLATE_IDS = {
  SUBMISSION_REQUESTED: 141,
  SUBMISSION_RECEIVED: 142,
  CHANGES_REQUESTED: 143,
  SUBMISSION_APPROVED: 144,
  SUBMISSION_REJECTED: 145,
  APPLICATION_RECEIVED_APPLICANT: 149,
  APPLICATION_RECEIVED_RECRUITING_TEAM: 150,
  APPLICATION_REJECTED: 152,

  TEAM_WELCOME: 187,

  MEMBERSHIP_INVITATION: 188,
  GETTING_TO_KNOW_DUE: 189,
} as const;

export type UserStateEmailEvent = "membership_invitation";

export const USER_STATE_EMAIL_TEMPLATES = {
  getting_to_know_due: {
    templateId: BREVO_TEMPLATE_IDS.GETTING_TO_KNOW_DUE,
    tag: "getting-to-know-due",
  },
  membership_invitation: {
    templateId: BREVO_TEMPLATE_IDS.MEMBERSHIP_INVITATION,
    tag: "membership-invitation",
  },
} as const satisfies Record<
  UserStateEmailEvent | "getting_to_know_due",
  { templateId: number | undefined; tag: string }
>;
