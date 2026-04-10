import type { TeamModePanelProps } from './create-video-panels.types';
import styles from '../page.module.css';

export function TeamModePanel({
  inviteEmail,
  onInviteEmailChange,
  inviteRole,
  onInviteRoleChange,
  onInviteMember,
  teamMembers,
  teamNotice,
}: TeamModePanelProps) {
  return (
    <section className={styles.toolPanel} aria-labelledby="team-mode-title">
      <div className={styles.toolHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Phase 35</p>
          <h3 className={styles.toolTitle} id="team-mode-title">
            Team mode
          </h3>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <input
          className={styles.textInput}
          onChange={(event) => onInviteEmailChange(event.target.value)}
          placeholder="teammate@example.com"
          value={inviteEmail}
        />
        <select
          className={styles.select}
          onChange={(event) => onInviteRoleChange(event.target.value as 'owner' | 'editor')}
          value={inviteRole}
        >
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <button className={styles.secondaryButton} onClick={onInviteMember} type="button">
        Invite member
      </button>

      <div className={styles.progressList}>
        {teamMembers.map((teamMember) => (
          <article className={styles.progressCard} key={teamMember.id}>
            <strong>{teamMember.email}</strong>
            <span className={styles.metaBadge}>{teamMember.role}</span>
          </article>
        ))}
      </div>

      {teamNotice ? <p className={styles.toolHint}>{teamNotice}</p> : null}
    </section>
  );
}
