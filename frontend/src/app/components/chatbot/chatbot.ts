import { Component, OnInit } from '@angular/core';
import { ChatbotService } from '../../services/chatbot';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
interface Message {
  text: string;
  from: 'user' | 'bot';
  time?: number;
}
@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot {
  open = false;
  inputText = '';
  messages: Message[] = [];
  loading = false;
  sound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

  constructor(private chatService: ChatbotService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      this.messages = JSON.parse(saved);
    }
  }

  toggle() {
    this.open = !this.open;
    if (this.open) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  private save() {
    localStorage.setItem('chat_history', JSON.stringify(this.messages));
  }

  scrollToBottom() {
    const el = document.querySelector('.chat-container');
    if (el) el.scrollTop = el.scrollHeight;
  }

  send() {
    const text = this.inputText.trim();
    if (!text) return;
    const userMsg: Message = { text, from: 'user', time: Date.now() };
    this.messages.push(userMsg);
    this.inputText = '';
    this.save();
    this.scrollToBottom();

    const loadingMsg: Message = { text: 'Writing...', from: 'bot', time: Date.now() };
    this.messages.push(loadingMsg);
    this.loading = true;
    this.save();
    this.scrollToBottom();

    this.chatService.send(text).subscribe({
      next: (res) => {
        const idx = this.messages.findIndex((m) => m.text === 'Writing...' && m.from === 'bot');
        if (idx !== -1) this.messages.splice(idx, 1); // احذف رسالة التحميل
        this.messages.push({ text: res.reply || 'لا يوجد رد', from: 'bot', time: Date.now() });
        this.sound.play();
        this.loading = false;
        this.save();
        this.scrollToBottom();
      },
      error: (err) => {
        const idx = this.messages.findIndex((m) => m.text === 'Writing...' && m.from === 'bot');
        if (idx !== -1) this.messages[idx].text = '⚠️ خطأ في الاتصال بالخادم.';
        this.loading = false;
        this.save();
        this.scrollToBottom();
      },
    });
  }

  clearHistory() {
    this.messages = [];
    localStorage.removeItem('chat_history');
  }
}
