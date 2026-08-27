import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../email/brevo", () => ({ sendMail: vi.fn() }));
vi.mock("../../email/urls", () => ({
  appUrl: vi.fn((path: string) => `https://ybase.example${path}`),
}));

import { sendMail } from "../../email/brevo";
import {
  sendGettingToKnowDueEmail,
  sendTeamWelcomeEmail,
  sendUserStateEmail,
} from "./email";

const user = {
  name: "Alex Beispiel",
  email: "alex@youngfounders.network",
  privateEmail: "alex@example.com",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(sendMail).mockResolvedValue({ status: "sent" });
});

describe("user-state emails", () => {
  it("sends team access and onboarding details in one email", async () => {
    await sendTeamWelcomeEmail({
      recoveryEmail: "alex@example.com",
      memberName: "Alex Beispiel",
      workspaceEmail: "alex@youngfounders.network",
      temporaryPassword: "temporary-password",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 187,
        params: expect.objectContaining({
          memberName: "Alex Beispiel",
          workspaceEmail: "alex@youngfounders.network",
          temporaryPassword: "temporary-password",
        }),
      }),
    );
  });

  it("sends the membership invitation after the getting-to-know phase", async () => {
    await sendUserStateEmail({ user, event: "membership_invitation" });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 188,
        params: expect.objectContaining({ memberName: "Alex Beispiel" }),
      }),
    );
  });

  it("sends the getting-to-know reminder through its Brevo template", async () => {
    await sendGettingToKnowDueEmail({
      recipient: {
        name: "Pat People",
        email: "pat@youngfounders.network",
      },
      member: user,
      endsAt: Date.parse("2030-09-02T10:00:00Z"),
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: "pat@youngfounders.network", name: "Pat People" }],
        templateId: 189,
        params: {
          memberName: "Alex Beispiel",
          memberEmail: "alex@youngfounders.network",
          endsOn: "02.09.2030",
          ybaseUrl: "https://ybase.example/members",
        },
        tags: ["ybase", "user-state", "getting-to-know-due"],
      }),
    );
  });

  it("reports a skipped getting-to-know reminder", async () => {
    vi.mocked(sendMail).mockResolvedValue({
      status: "skipped",
      reason: "disabled",
    });

    await expect(
      sendGettingToKnowDueEmail({
        recipient: { email: "pat@youngfounders.network" },
        member: user,
        endsAt: Date.parse("2030-09-02T10:00:00Z"),
      }),
    ).rejects.toThrow("konnte nicht versendet werden");
  });
});
