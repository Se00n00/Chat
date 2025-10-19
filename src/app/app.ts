import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent} from 'ngx-markdown'

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, MarkdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  Conversation:WritableSignal<any[]> = signal([
    {"type":"SYSTEM","content":"Welcome to Chat Application, Ask any question using the input box"}
  ])

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
      this.Conversation.update(prev => [
        ...prev,
        {type:"ASSISTANT", heading:"", content:""}
      ]);

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

        if (data.type === "ASSISTANT") {
          this.Conversation.update(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;

            if (updated[lastIndex]?.type === "ASSISTANT") {
              // Append new content to the last assistant message
              updated[lastIndex] = {
                ...updated[lastIndex],
                heading: data.heading ?? updated[lastIndex].heading,
                content:
                  (updated[lastIndex].content || "") +
                  (data.answer ?? "")
              };
            } else {
              updated.push({
                type: "ASSISTANT",
                heading: data.heading ?? "Response",
                content: data.answer ?? ""
              });
            }

            return updated;
          });
        } else if (data.type === "SYSTEM") {
          this.Conversation.update(prev => [
            ...prev,
            { type: "SYSTEM", heading: "System Message", content: data.answer ?? "" }
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
  
}