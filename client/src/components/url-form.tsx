import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { youtubeUrlSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

// Use the schema from shared, but rename the property to match our form field
const formSchema = youtubeUrlSchema;

interface UrlFormProps {
  onSubmit: (url: string) => void;
}

export default function UrlForm({ onSubmit }: UrlFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.url);
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Generate YouTube Summary</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">YouTube URL</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="rounded-r-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-blue-700 rounded-l-none flex items-center transition-colors"
                      disabled={form.formState.isSubmitting}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Summarize
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
