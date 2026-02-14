// src/utils/userFeedback.ts
// User Feedback Collection System

interface FeedbackData {
  userId?: string;
  userEmail?: string;
  feedbackType: 'bug' | 'feature' | 'general' | 'rating';
  rating?: number; // 1-5 stars
  title: string;
  description: string;
  category?: string;
  pageUrl: string;
  userAgent: string;
  timestamp: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface NPSData {
  userId?: string;
  score: number; // 0-10
  feedback?: string;
  timestamp: string;
  source: string;
}

export class UserFeedbackSystem {
  private feedbackEndpoint = '/api/feedback';
  private npsEndpoint = '/api/nps';

  constructor() {
    this.initFeedbackCollection();
  }

  private initFeedbackCollection() {
    if (import.meta.env.PROD) {
      this.initExitIntentPopup();
      this.initPeriodicFeedbackPrompt();
    }
  }

  private initExitIntentPopup() {
    let exitIntentShown = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        this.showFeedbackModal('exit_intent');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    // Clean up after 30 seconds to avoid annoying users
    setTimeout(() => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    }, 30000);
  }

  private initPeriodicFeedbackPrompt() {
    // Show feedback prompt after 5 minutes of activity
    setTimeout(() => {
      if (!localStorage.getItem('feedback_prompt_shown')) {
        this.showFeedbackModal('periodic');
        localStorage.setItem('feedback_prompt_shown', 'true');
      }
    }, 5 * 60 * 1000);
  }

  public showFeedbackModal(source: string) {
    // Create feedback modal
    const modal = this.createFeedbackModal(source);
    document.body.appendChild(modal);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 30000);
  }

  private createFeedbackModal(source: string): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">How are we doing?</h3>
          <button class="text-gray-400 hover:text-gray-600 text-xl" onclick="this.closest('.fixed').remove()">×</button>
        </div>

        <div class="space-y-4">
          <div class="flex justify-center space-x-2">
            ${[1, 2, 3, 4, 5].map(star => `
              <button class="text-2xl text-gray-300 hover:text-yellow-400 transition-colors star-rating" data-rating="${star}">
                ★
              </button>
            `).join('')}
          </div>

          <textarea
            placeholder="Tell us what you think..."
            class="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows="3"
            maxlength="500"
          ></textarea>

          <div class="flex justify-end space-x-2">
            <button class="px-4 py-2 text-gray-600 hover:text-gray-800" onclick="this.closest('.fixed').remove()">
              Maybe later
            </button>
            <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 submit-feedback">
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    this.addModalEventListeners(modal, source);

    return modal;
  }

  private addModalEventListeners(modal: HTMLElement, source: string) {
    let selectedRating = 0;

    // Star rating
    modal.querySelectorAll('.star-rating').forEach((star, index) => {
      star.addEventListener('click', () => {
        selectedRating = index + 1;
        // Update star display
        modal.querySelectorAll('.star-rating').forEach((s, i) => {
          (s as HTMLElement).style.color = i <= index ? '#fbbf24' : '#d1d5db';
        });
      });
    });

    // Submit feedback
    modal.querySelector('.submit-feedback')?.addEventListener('click', () => {
      const feedback = (modal.querySelector('textarea') as HTMLTextAreaElement)?.value || '';

      if (selectedRating > 0 || feedback.trim()) {
        this.submitFeedback({
          feedbackType: 'rating',
          rating: selectedRating,
          title: `User feedback from ${source}`,
          description: feedback,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          metadata: { source, userRating: selectedRating }
        });

        modal.remove();
        this.showThankYouMessage();
      }
    });
  }

  private showThankYouMessage() {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = 'Thank you for your feedback!';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  public async submitFeedback(feedback: Omit<FeedbackData, 'userId' | 'userEmail' | 'sessionId'>) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${this.feedbackEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
      } else {
        console.warn('Failed to submit feedback');
      }
    } catch (error) {
      console.warn('Error submitting feedback:', error);
      // Store locally for later submission
      this.storeFeedbackLocally(feedback);
    }
  }

  public async submitNPS(score: number, feedback?: string) {
    try {
      const npsData: NPSData = {
        score,
        feedback,
        timestamp: new Date().toISOString(),
        source: 'post_auction'
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}${this.npsEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        },
        body: JSON.stringify(npsData)
      });

      if (response.ok) {
        console.log('NPS submitted successfully');
      }
    } catch (error) {
      console.warn('Error submitting NPS:', error);
    }
  }

  private storeFeedbackLocally(feedback: any) {
    const stored = JSON.parse(localStorage.getItem('pending_feedback') || '[]');
    stored.push({ ...feedback, storedAt: Date.now() });
    localStorage.setItem('pending_feedback', JSON.stringify(stored));
  }

  public async syncPendingFeedback() {
    const pending = JSON.parse(localStorage.getItem('pending_feedback') || '[]');
    if (pending.length > 0) {
      // Try to submit pending feedback
      for (const feedback of pending) {
        await this.submitFeedback(feedback);
      }
      localStorage.removeItem('pending_feedback');
    }
  }

  // Public method for manual feedback submission
  public openFeedbackForm() {
    this.showFeedbackModal('manual');
  }
}

// Global feedback system instance
export const userFeedback = new UserFeedbackSystem();
