import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";

const schema = z.object({
  welcomeMessage: z.string().min(10, "Hoş geldin mesajı en az 10 karakter olmalı"),
  goodbyeMessage: z.string().min(10, "Uğurlama mesajı en az 10 karakter olmalı"),
  rulesEmbed: z.string().optional()
});

type WelcomeForm = z.infer<typeof schema>;

const fetchSettings = async () => {
  const { data, error } = await supabase
    .from("guild_settings")
    .select("welcome_message, goodbye_message, rules_embed")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const rulesPlaceholder = '{"title":"Kurallar", ... }';

export const WelcomePage = () => {
  const { data, refetch } = useQuery({ queryKey: ["guild-settings"], queryFn: fetchSettings });
  const form = useForm<WelcomeForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      welcomeMessage: "CyberHub'a hoş geldiniz!",
      goodbyeMessage: "Aramızdan ayrılan herkese başarılar!",
      rulesEmbed: ""
    }
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      welcomeMessage: data?.welcome_message ?? "CyberHub'a hoş geldiniz!",
      goodbyeMessage: data?.goodbye_message ?? "Aramızdan ayrılan herkese başarılar!",
      rulesEmbed: data?.rules_embed ?? ""
    });
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.from("guild_settings").upsert({
      id: 1,
      guild_id: "primary",
      welcome_message: values.welcomeMessage,
      goodbye_message: values.goodbyeMessage,
      rules_embed: values.rulesEmbed ?? null
    });
    if (error) {
      console.error(error);
      return;
    }
    await refetch();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Karşılama Mesajları</CardTitle>
        <CardDescription>Yeni üyeler için embed tabanlı karşılama mesajını düzenle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="welcome-message">
              Hoş geldin mesajı
            </label>
            <Textarea id="welcome-message" rows={4} {...form.register("welcomeMessage")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="goodbye-message">
              Ayrılma mesajı
            </label>
            <Textarea id="goodbye-message" rows={4} {...form.register("goodbyeMessage")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="rules-embed">
              Kurallar Embed JSON
            </label>
            <Textarea
              id="rules-embed"
              rows={6}
              placeholder={rulesPlaceholder}
              {...form.register("rulesEmbed")}
            />
          </div>
          <Button type="submit">Kaydet</Button>
        </form>
      </CardContent>
    </Card>
  );
};
