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


  Conversation:WritableSignal<any[]> = signal([
    // {"type":"SYSTEM","content":"Welcome to Chat Application, Ask any question using the input box"},
    // {"type":"USER","content":"Its me user, Ask any question using the input box"},
    // {
    //   "type":"LOGS",
    //   "content":[
    //     {
    //       "type": "ASSISTANT",
    //       "content": {
    //         "metadata": {
    //           "id": "chatcmpl-f0604589-69cf-455e-ad18-c91a04648208",
    //           "model": "openai/gpt-oss-120b",
    //           "created": 1765135214,
    //           "object": "chat.completion",
    //           "prompt_tokens": 1668,
    //           "prompt_tokens_details": 1536,
    //           "completion_tokens": 481,
    //           "reasoning_tokens": 313,
    //           "prompt_time": 0.012096476,
    //           "queue_time": 0.049478594,
    //           "completion_time": 1.041399609,
    //           "total_tokens": 2149,
    //           "total_time": 1.053496085,
    //           "system_fingerprint": "fp_fd1fe7f861",
    //           "service_tier": "on_demand",
    //           "x_groq": "req_01kbx43rjvfkxrks017yvsmghg",
    //           "resoning": "The system wants us to output an Action JSON with name and arguments. The user gave a managed_agent with a task: basically says \"Hiii\"... (ENTIRE reasoning text you provided)"
    //         },
    //         "response": {
    //           "name": "final_answer",
    //           "arguments": "{} sf sfs{{### 1. Task outcome (short version):\nHello! How can I assist you today?\n\n### 2. Task outcome (extremely detailed version):\nThe user sent a friendly greeting \"Hiii\", which is an informal way of saying hello. This indicates they are open to interaction and likely expect a courteous response. I acknowledge the greeting, express willingness to help, and invite the user to specify any question, request, or topic they would like assistance with.\n\n### 3. Additional context (if relevant):\nNo further context was provided. Please let me know what you need help with, and I will be glad to assist.",
              
    //         }
    //       }
    //     },
    //     {"type":"TRACE","content":{"name":"browser_use","output":"Tools Output Blah Blah"}},
    //   ]
    // },
    // {"type":"FINAL_ANSWER","content":"Tools Output Blah Blah"},
    // {"type":"ERROR","content":"some error"}
  ])


  
  
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      
      if (params['q'] != ''){
        this.Conversation.update(prev => [
          ...prev,
          { type: "USER", content: params['q'] }
        ]);
        this.queryLLM(params['q'] ?? '')
      }
      
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
          this.Conversation.update(prev => [
            ...prev,
            { type: "USER", content: this.text() }
          ]);
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
    
    let res = await fetch(import.meta.env.NG_APP_BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: prompt })
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    try {

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
        console.log("DATA : ",data) // TODO: Remove after successful trials

        if (data.type === "ASSISTANT" || data.type === "TRACE") {
          this.Conversation.update(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];

            if (last?.type === "LOGS") {
              updated[updated.length - 1] = {
                ...last,
                content: [
                  ...last.content,
                  {
                    type: data.type,
                    content: data.content ?? data
                  }
                ]
              };
            } else {
              updated.push({
                type: "LOGS",
                content: [
                  {
                    type: data.type,
                    content: data.content ?? data
                  }
                ]
              });
            }

            return updated;
          });
        }
        else if (data.type === "SYSTEM") { //else : FINAL_ANSWER, SYSTEM, USER, ERROR
          this.Conversation.update(prev => [
            ...prev,
            { type: "SYSTEM", content: data.content ?? "" }
          ]);
        }else if (data.type === "ERROR") {
          this.Conversation.update(prev => [
            ...prev,
            { type: "ERROR", content: data.content ?? "" }
          ]);
        }
        else if (data.type === "FINAL_ANSWER") {
          this.Conversation.update(prev => [
            ...prev,
            { type: "FINAL_ANSWER", content: data.content ?? "" }
          ]);
        }
      }
    } catch (err) {
      this.Conversation.update(prev => [
        ...prev,
        { type: "ERROR", content: String(err) }
      ]);
    }

  }
}
