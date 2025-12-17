import { Component, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent} from 'ngx-markdown';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    MarkdownComponent
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  id: string = "";
  model: string = "";
  created: number = 0;
  object: string = "";

  prompt_tokens: number = 0;
  prompt_tokens_details: number = 0;
  completion_tokens: number = 0;
  reasoning_tokens: number = 0;

  prompt_time: number = 0.0;
  queue_time: number = 0.0;
  completion_time: number = 0.0;

  total_tokens: number = 0;
  total_time: number = 0.0;

  system_fingerprint: string = "";
  service_tier: string = "";
  x_groq: string = ""

  reasoning: string = ""


  Conversation:WritableSignal<any[]> = signal([
    {"type":"SYSTEM","content":"Welcome to Chat Application, Ask any question using the input box"},
    {
      "type": "ASSISTANT",
      "content": {
        "metadata": {
          "id": "chatcmpl-f0604589-69cf-455e-ad18-c91a04648208",
          "model": "openai/gpt-oss-120b",
          "created": 1765135214,
          "object": "chat.completion",
          "prompt_tokens": 1668,
          "prompt_tokens_details": 1536,
          "completion_tokens": 481,
          "reasoning_tokens": 313,
          "prompt_time": 0.012096476,
          "queue_time": 0.049478594,
          "completion_time": 1.041399609,
          "total_tokens": 2149,
          "total_time": 1.053496085,
          "system_fingerprint": "fp_fd1fe7f861",
          "service_tier": "on_demand",
          "x_groq": "req_01kbx43rjvfkxrks017yvsmghg",
          "resoning": "The system wants us to output an Action JSON with name and arguments. The user gave a managed_agent with a task: basically says \"Hiii\"... (ENTIRE reasoning text you provided)"
        },
        "response": {
          "name": "final_answer",
          "arguments": {
            "answer": "### 1. Task outcome (short version):\nHello! How can I assist you today?\n\n### 2. Task outcome (extremely detailed version):\nThe user sent a friendly greeting \"Hiii\", which is an informal way of saying hello. This indicates they are open to interaction and likely expect a courteous response. I acknowledge the greeting, express willingness to help, and invite the user to specify any question, request, or topic they would like assistance with.\n\n### 3. Additional context (if relevant):\nNo further context was provided. Please let me know what you need help with, and I will be glad to assist."
          }
        }
      }
    },
    {"type":"ERROR","content":"some error"}
  ])


  
  
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.queryLLM(params['q'] ?? '')
    });
  }

  text: WritableSignal<string> = signal('');
  isTouched = signal(false)
  onUserNameChange(newText: string) {
    this.isTouched.update((val)=>true)
    this.text.set(newText);
    if (this.text().length !== 0) {
      this.prepareToSend(3, this.text(), "paper");
    }
  }
  timeLeftToSend = signal(10);
  private intervalId: any = null;
  prepareToSend(num: number, query:string, type:string) {
    this.timeLeftToSend.set(num);

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.timeLeftToSend.update((val) => {
        if (val > 1) {
          return val - 1;
        } else {
          clearInterval(this.intervalId);
          this.intervalId = null;

          this.isTouched.update((val)=>val = false)
          this.queryLLM(this.text())
          this.text.set("")
          return 0;
        }
      });
    }, 1000);
  }

  newConversation(){
    this.Conversation.set([
      {"type":"SYSTEM","content":"Welcome to New Conversation, Ask any question using the input box"}

    ])
  }

  async queryLLM(prompt: string) {
    this.Conversation.update(prev => [
      ...prev,
      {type:"USER", heading:null, content:prompt}
    ]);

    let res = await fetch(import.meta.env.NG_APP_BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: prompt })
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    try {
      // this.Conversation.update(prev => [
      //   ...prev,
      //   {type:"ASSISTANT", heading:"", content:""}
      // ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk.trim()) continue;

        let data;
        try {
          data = JSON.parse(chunk);
        } catch {
          console.warn("Non-JSON chunk:", chunk);
          continue;
        }
        console.log(data)

        if (data.type === "ASSISTANT") {

          let content = data.content;

          if (typeof content === "string" && content.startsWith("{")) {
              try {
                  const inner = JSON.parse(content);

                  // If it's a final_answer tool call
                  if (inner.response?.arguments?.answer) {
                      content = inner.response.arguments.answer;
                  } else {
                      content = JSON.stringify(inner, null, 2);
                  }
              } catch (e) {
                  // leave as raw string
              }
          }


          // const heading = data.content?.metadata?.heading ?? data.heading ?? "";

          this.Conversation.update(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;

            if (updated[lastIndex]?.type === "ASSISTANT") {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content || (typeof content === "object" ? JSON.stringify(content) : content)
              };
            } else {
              updated.push({
                type: "ASSISTANT",
                heading: "",
                content: content
              });
            }

            const meta = content.metadata;
            const reasoning = meta.resoning ?? "";

            this.id = meta.id;
            this.model = meta.model;
            this.created = meta.created;
            this.object = meta.object;

            this.prompt_tokens = meta.prompt_tokens;
            this.prompt_tokens_details = meta.prompt_tokens_details;
            this.completion_tokens = meta.completion_tokens;
            this.reasoning_tokens = meta.reasoning_tokens;

            this.prompt_time = meta.prompt_time;
            this.queue_time = meta.queue_time;
            this.completion_time = meta.completion_time;

            this.total_tokens = meta.total_tokens;
            this.total_time = meta.total_time;

            this.system_fingerprint = meta.system_fingerprint;
            this.service_tier = meta.service_tier;
            this.x_groq = meta.x_groq;

            this.reasoning = reasoning;
            console.log(updated)

            return updated;
          });
        }else if (data.type === "SYSTEM") {
          this.Conversation.update(prev => [
            ...prev,
            { type: "SYSTEM", heading: "System Message", content: data.content ?? "" }
          ]);
        }else if (data.type === "ERROR") {
          this.Conversation.update(prev => [
            ...prev,
            { type: "ERROR", heading: "", content: data.content ?? "" }
          ]);
        }
        else if (data.type === "FINAL_ANSWER") {
          this.Conversation.update(prev => [
            ...prev,
            { type: "FINAL_ANSWER", heading: "", content: data.content ?? "" }
          ]);
        }
      }
    } catch (err) {
      this.Conversation.update(prev => [
        ...prev,
        { type: "SYSTEM", heading: "Error", content: String(err) }
      ]);
    }

  }

  update_meta(content: any) {
    if (!content || typeof content !== "object") return;

    const meta = content.metadata;
    if (!meta) return;

    // basic metadata
    this.id = meta.id ?? this.id;
    this.model = meta.model ?? this.model;
    this.created = meta.created ?? this.created;
    this.object = meta.object ?? this.object;

    // token counts
    this.prompt_tokens = meta.prompt_tokens ?? this.prompt_tokens;
    this.prompt_tokens_details = meta.prompt_tokens_details ?? this.prompt_tokens_details;
    this.completion_tokens = meta.completion_tokens ?? this.completion_tokens;
    this.reasoning_tokens = meta.reasoning_tokens ?? this.reasoning_tokens;

    // timings
    this.prompt_time = meta.prompt_time ?? this.prompt_time;
    this.queue_time = meta.queue_time ?? this.queue_time;
    this.completion_time = meta.completion_time ?? this.completion_time;

    this.total_tokens = meta.total_tokens ?? this.total_tokens;
    this.total_time = meta.total_time ?? this.total_time;

    // system info
    this.system_fingerprint = meta.system_fingerprint ?? this.system_fingerprint;
    this.service_tier = meta.service_tier ?? this.service_tier;
    this.x_groq = meta.x_groq ?? this.x_groq;

    // IMPORTANT: Key is "resoning" not "reasoning"
    this.reasoning = meta.resoning ?? this.reasoning;
  }

}
