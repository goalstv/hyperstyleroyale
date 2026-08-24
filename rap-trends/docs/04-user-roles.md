# RAP TRENDS — User Roles and Permissions

Implemented in `src/lib/roles.ts`. Enforced by `src/lib/session.ts` on every route, action, and API
call. Tested in `tests/data-integrity.test.ts`.

## Model

A **role** is a named set of **permissions**. A user holds one or more roles; their effective
permission set is the union. Route guards resolve that union and either render the page or return
`PermissionDenied`, which names the missing permission rather than pretending the route does not
exist — an operator who cannot reach something should know why.

Navigation is filtered by the same set, so a journalist never sees a link into master control.
Filtering is a convenience; the server-side check is the control.

## Permissions

| Group | Permissions |
|---|---|
| Console | `os.view` |
| Editorial | `newsroom.read` `newsroom.write` `newsroom.assign` `newsroom.approve` `newsroom.publish` |
| Media | `media.read` `media.write` `media.qc` |
| Scheduling | `schedule.read` `schedule.write` `schedule.approve` |
| Channel | `channel.monitor` `channel.control` `channel.emergency` |
| Distribution | `distribution.read` `distribution.write` |
| Advertising | `ads.read` `ads.write` `ads.approve` |
| Rights | `rights.read` `rights.write` |
| Affiliates | `affiliates.read` `affiliates.write` |
| Analytics | `analytics.read` |
| Administration | `users.manage` `drive.manage` |

## Roles

### Founder / Network Administrator
Every permission. The only role that can manage users and change Index weight profiles.

### Editor-in-Chief
The newsroom, end to end: assign, approve, publish, manage the Drive connection. Reads media,
schedule, distribution, rights, and analytics. **Cannot** touch air, traffic advertising, or manage
users. Applies Index editorial overrides, each recorded with a reason and their name.

### Journalist — *Rahman's workspace*
Exactly five permissions: `os.view`, `newsroom.read`, `newsroom.write`, `media.read`,
`analytics.read`.

Draft, edit, organise, and file. Can move a story as far as **Editing** and no further — fact check,
approval, scheduling, and publication belong to the editor-in-chief, enforced by the workflow state
machine rather than by convention. No route into programming, master control, distribution,
advertising, rights, or user management. The newsroom renders as "Your desk", filtered to their own
stories.

### Video Producer
Media read, write, and QC. Reads the newsroom and the schedule. Cannot publish or schedule.

### Programming Director
Builds, edits, and approves schedules. Monitors channels. Reads media, rights, distribution, and
analytics. Cannot cut to air or fire the emergency override.

### Master-Control Operator
Monitors and controls channels, including the emergency override. Reads the schedule and media.
Cannot edit the schedule, the newsroom, or anything commercial. The narrowest role with the most
consequential single action, deliberately.

### Social-Media Producer
Reads the newsroom, media, distribution, and analytics. Publishes to social surfaces. No write
access to editorial or air.

### Advertising & Sponsorship Manager
Advertisers, campaigns, and inventory. Reads analytics and distribution. **No editorial permission
of any kind** — this is the firewall, expressed as an access-control fact and asserted in the test
suite.

### Rights & Compliance Manager
Rights records, media QC, and campaign compliance approval — the only role besides the founder that
can clear a restricted-category campaign for traffic. Reads schedule, ads, and distribution.

### Affiliate Manager
Affiliate records, distribution endpoints, schedules, and analytics. No editorial or air access.

### Analytics Viewer
`os.view` and `analytics.read`. For investors, board members, and partners who need numbers without
operational access.

### External Contributor
`os.view`, `newsroom.read`, `newsroom.write`. Can draft and move a piece to Editing. Sees only their
own work. For correspondents and freelancers.

## Audience-facing roles

`artist`, `affiliate`, and `member` hold **no console permissions at all**. They authenticate
against the public site and reach the artist portal, the affiliate portal, and membership features.
`isStaffRole()` returns false for all three, and the test suite asserts it.

## Workflow transition rights

Which states each role may move a story *into*:

| Role | Permitted target states |
|---|---|
| Founder | All |
| Editor-in-Chief | All |
| Journalist | `idea`, `drafting`, `editing` |
| External Contributor | `drafting`, `editing` |
| Video Producer | `idea` |
| Social Producer | `idea` |
| Everyone else | None |

Gates that apply regardless of role: approval requires a cleared fact check and at least one source
citation; scheduling requires a publish time; publication requires a cleared fact check, an expired
embargo, and SEO metadata.

## Demonstration role switcher

The console header carries an operator selector that sets the `rt_os_user` cookie the real guards
read. It exists so the whole permission model can be walked through without an identity provider. In
production the control does not exist and `getSessionUser()` resolves a real session — every check
it exercises is the production check.
