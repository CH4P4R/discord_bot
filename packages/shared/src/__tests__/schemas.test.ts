import { describe, expect, it } from 'vitest';
import { guildSettingsSchema } from '../schemas';

describe('guildSettingsSchema', () => {
  it('parses valid configuration', () => {
    const result = guildSettingsSchema.parse({
      autoRoleIds: ['123', '456'],
      welcomeChannelId: '789',
      goodbyeChannelId: null,
      logChannelId: '000',
      announcementChannelId: null
    });

    expect(result.autoRoleIds).toHaveLength(2);
  });
});
