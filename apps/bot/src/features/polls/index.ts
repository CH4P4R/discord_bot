import type { Feature } from "../../core/feature";

const EMOJIS = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"];

type SurveyRecord = {
  id: number;
  message_id: string | null;
  options: string[];
  votes: Record<string, number>;
};

const feature: Feature = {
  name: "polls",
  description: "Anketlerin oy sayilarini takip eder ve Supabase'e kaydeder.",
  enabled: true,
  async init(client) {
    const { data, error } = await client.supabase
      .from("surveys")
      .select("id, message_id, options, votes");

    if (error) {
      client.logger.error("Failed to fetch surveys", error);
      return;
    }

    const pollCache = new Map<string, SurveyRecord>();
    const surveys = (data as SurveyRecord[]) ?? [];
    surveys.forEach((survey) => {
      if (survey.message_id) pollCache.set(survey.message_id, survey);
    });

    const updatePollVotes = async (messageId: string, emoji: string, count: number) => {
      const poll = pollCache.get(messageId);
      if (!poll) return;
      const optionIndex = EMOJIS.indexOf(emoji);
      if (optionIndex === -1) return;
      const votes = { ...poll.votes, [optionIndex]: count };
      poll.votes = votes;

      const { error: updateError } = await client.supabase
        .from("surveys")
        .update({ votes })
        .eq("id", poll.id);

      if (updateError) {
        client.logger.error("Failed to update poll votes", updateError);
      }
    };

    client.on("messageReactionAdd", async (reaction, user) => {
      if (user.bot) return;
      const messageId = reaction.message.id;
      const poll = pollCache.get(messageId);
      if (!poll) return;

      const emoji = reaction.emoji.name;
      if (!emoji || !EMOJIS.includes(emoji)) return;

      const count = (await reaction.fetch()).count ?? 0;
      await updatePollVotes(messageId, emoji, Math.max(count - 1, 0));
    });

    client.on("messageReactionRemove", async (reaction, user) => {
      if (user.bot) return;
      const messageId = reaction.message.id;
      const poll = pollCache.get(messageId);
      if (!poll) return;
      const emoji = reaction.emoji.name;
      if (!emoji || !EMOJIS.includes(emoji)) return;

      const count = (await reaction.fetch()).count ?? 0;
      await updatePollVotes(messageId, emoji, Math.max(count - 1, 0));
    });
  }
};

export default feature;
