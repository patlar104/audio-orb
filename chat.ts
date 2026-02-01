/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@customElement('gdm-chat')
export class GdmChat extends LitElement {
  @state() messages: Message[] = [];
  @state() inputValue = '';
  @state() isLoading = false;
  @state() error = '';

  private client: GoogleGenerativeAI;
  private messagesContainer: HTMLElement | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      display: flex;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      justify-content: flex-end;
    }

    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      word-wrap: break-word;
    }

    .message.user .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom-right-radius: 4px;
    }

    .message.assistant .message-content {
      background: rgba(255, 255, 255, 0.1);
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .input-area {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .input-wrapper {
      flex: 1;
      display: flex;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 8px 16px;
      align-items: center;
    }

    input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: white;
      font-size: 16px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }

    .button-group {
      display: flex;
      gap: 8px;
    }

    button {
      outline: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 20px;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .send-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      width: 44px;
    }

    .live-button {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border: none;
      width: 44px;
      position: relative;
    }

    .live-button::before {
      content: '⭐';
      position: absolute;
      font-size: 12px;
      top: 2px;
      right: 2px;
    }

    .error {
      background: rgba(245, 87, 108, 0.2);
      border: 1px solid rgba(245, 87, 108, 0.5);
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin: 0 20px;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      padding: 0 20px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
      animation: bounce 1.4s infinite;
    }

    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        opacity: 0.5;
        transform: translateY(0);
      }
      40% {
        opacity: 1;
        transform: translateY(-8px);
      }
    }
  `;

  constructor() {
    super();
    this.initClient();
  }

  private initClient() {
    this.client = new GoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendMessage() {
    if (!this.inputValue.trim() || this.isLoading) return;

    const userMessage: Message = {
      id: this.generateMessageId(),
      role: 'user',
      content: this.inputValue,
      timestamp: new Date(),
    };

    this.messages = [...this.messages, userMessage];
    this.inputValue = '';
    this.isLoading = true;
    this.error = '';

    this.scrollToBottom();

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const response = await model.generateContent(this.inputValue);
      const assistantMessage: Message = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: response.response.text(),
        timestamp: new Date(),
      };

      this.messages = [...this.messages, assistantMessage];
      this.scrollToBottom();
    } catch (err) {
      this.error = `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`;
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer?.scrollTo(0, this.messagesContainer.scrollHeight);
    }, 0);
  }

  protected firstUpdated() {
    this.messagesContainer = this.shadowRoot?.querySelector('.chat-container') || null;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  render() {
    return html`
      <div class="chat-container" @scroll=${() => {}}>
        ${this.messages.map(
          (msg) => html`
            <div class="message ${msg.role}">
              <div class="message-content">${msg.content}</div>
            </div>
          `
        )}
        ${this.isLoading
          ? html`
              <div class="loading">
                <span>AI is thinking</span>
                <div class="typing-indicator">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
            `
          : ''}
      </div>

      ${this.error
        ? html`<div class="error">${this.error}</div>`
        : ''}

      <div class="input-area">
        <div class="input-wrapper">
          <input
            type="text"
            placeholder="Type a message..."
            .value=${this.inputValue}
            @input=${(e: Event) =>
              (this.inputValue = (e.target as HTMLInputElement).value)}
            @keydown=${this.handleKeyDown}
            ?disabled=${this.isLoading}
          />
        </div>
        <div class="button-group">
          <button
            @click=${() => this.sendMessage()}
            ?disabled=${this.isLoading || !this.inputValue.trim()}
            title="Send message">
            📤
          </button>
          <button
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent('switch-mode', { detail: { mode: 'live' } })
              )}
            class="live-button"
            title="Switch to Live Audio">
            🎙️
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gdm-chat': GdmChat;
  }
}
