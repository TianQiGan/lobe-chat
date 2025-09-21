import { StateCreator } from 'zustand/vanilla';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatStore } from '@/store/chat/store';
import { ChatAutoSuggestions, ChatSuggestion } from '@/types/message';
import { generateAutoSuggestions } from '@/utils/suggestion';
import { Action, setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../../selectors';

const n = setNamespace('autoSuggestion');

export interface ChatAutoSuggestionAction {
  /**
   * Generate auto-suggestions for a message
   */
  generateSuggestions: (messageId: string) => Promise<void>;
  /**
   * Update suggestions for a message
   */
  updateMessageSuggestions: (messageId: string, suggestions: ChatAutoSuggestions) => Promise<void>;
}

export const chatAutoSuggestion: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAutoSuggestionAction
> = (set, get) => ({
  generateSuggestions: async (messageId: string) => {
    const { updateMessage } = get();
    const messages = chatSelectors.currentChats(get());
    const message = messages.find((msg) => msg.id === messageId);

    if (!message || message.role !== 'assistant') {
      return;
    }

    // Get agent configuration
    const agentState = useAgentStore.getState();
    const agentConfig = agentSelectors.currentAgentConfig(agentState);
    
    // Check if auto-suggestions are enabled
    if (!agentConfig.autoSuggestion?.enabled) {
      return;
    }

    try {
      // Set loading state
      await updateMessage(messageId, {
        extra: {
          ...message.extra,
          autoSuggestions: {
            suggestions: [],
            loading: true,
          },
        },
      });

      // Generate suggestions
      const suggestions = await generateAutoSuggestions({
        messages,
        systemRole: agentConfig.systemRole,
        customPrompt: agentConfig.autoSuggestion.customPrompt,
        maxSuggestions: agentConfig.autoSuggestion.maxSuggestions,
      });

      // Update message with suggestions
      await updateMessage(messageId, {
        extra: {
          ...message.extra,
          autoSuggestions: {
            suggestions,
            loading: false,
          },
        },
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      
      // Clear loading state on error
      await updateMessage(messageId, {
        extra: {
          ...message.extra,
          autoSuggestions: {
            suggestions: [],
            loading: false,
          },
        },
      });
    }
  },

  updateMessageSuggestions: async (messageId: string, suggestions: ChatAutoSuggestions) => {
    const { updateMessage } = get();
    const messages = chatSelectors.currentChats(get());
    const message = messages.find((msg) => msg.id === messageId);

    if (!message) {
      return;
    }

    await updateMessage(messageId, {
      extra: {
        ...message.extra,
        autoSuggestions: suggestions,
      },
    });
  },
});