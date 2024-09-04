import { relations } from "drizzle-orm"
import { account, organization, organizationInvitation } from "./organization"
import { password, profile, user } from "./user"

export const userRelations = relations(user, ({ many, one }) => ({
  password: one(password, {
    fields: [user.id],
    references: [password.userId],
  }),
  accounts: many(account),
  profile: one(profile),
}))

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  accounts: many(account),
  invitations: many(organizationInvitation),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [account.organizationId],
    references: [organization.id],
  }),
}))

export const organizationInvitationRelations = relations(
  organizationInvitation,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationInvitation.organizationId],
      references: [organization.id],
    }),
  }),
)
