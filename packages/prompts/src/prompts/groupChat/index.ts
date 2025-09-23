import { ChatMessage } from '@/types/index';

export interface GroupMemberInfo {
  id: string;
  title: string;
}

const buildGroupMembersTag = (members: GroupMemberInfo[]): string => {
  if (!members || members.length === 0) return '';
  return `<group_members>\n${JSON.stringify(members, null, 2)}\n</group_members>`;
};

const buildChatHistoryAuthorTag = (messages: ChatMessage[], members: GroupMemberInfo[]): string => {
  if (!messages || messages.length === 0) return '';

  const idToTitle = new Map(members.map((m) => [m.id, m.title]));

  const authorLines = messages
    .map((message, index) => {
      let author: string;
      if (message.role === 'user') {
        author = idToTitle.get('user') || 'User';
      } else if (message.agentId) {
        author = idToTitle.get(message.agentId) || 'Assistant';
      } else {
        author = 'Assistant';
      }
      return `${index + 1}: ${author}`;
    })
    .join('\n');

  return `<chat_history_author>\n${authorLines}\n</chat_history_author>`;
};

export const buildGroupChatSystemPrompt = ({
  baseSystemRole = '',
  agentId,
  groupMembers,
  messages,
}: {
  agentId: string;
  baseSystemRole?: string;
  groupMembers: GroupMemberInfo[];
  messages: ChatMessage[];
}): string => {
  const membersTag = buildGroupMembersTag(groupMembers);
  const historyTag = buildChatHistoryAuthorTag(messages, groupMembers);

  const agentTitle = groupMembers.find((m) => m.id === agentId)?.title || 'Agent';

  const prompt = `${baseSystemRole}
You are participating in a group chat in real world.

Guidelines:
- Stay in character as ${agentId} (${agentTitle})
- Be concise and natural, behave like a real person
- Engage naturally in the conversation flow
- The group supervisor will decide whether to send it privately or publicly, so you just need to say the actuall content, even it's a DM to a specific member. Do not pretend you've sent it.
- Be collaborative and build upon others' responses when appropriate
- Keep your responses concise and relevant to the ongoing discussion
- Each message should no more than 100 words

${membersTag}

${historyTag}
`;

  return prompt.trim();
};

export interface SupervisorPromptParams {
  allowDM?: boolean;
  availableAgents: Array<{ id: string; title?: string | null }>;
  conversationHistory: string;
  systemPrompt?: string;
  userName?: string;
}

export const buildSupervisorPrompt = ({
  allowDM = true,
  availableAgents,
  conversationHistory,
  systemPrompt,
  userName,
}: SupervisorPromptParams): string => {
  const members = [
    {
      id: 'user',
      name: userName || 'User',
      role: 'Human participant',
    },
    // Then include all agents
    ...availableAgents.map((agent) => ({
      id: agent.id,
      name: agent.title || agent.id,
      role: 'AI Agent',
    })),
  ];

  const memberList = members
    .map((member) => `  <member id="${member.id}" name="${member.name}" />`)
    .join('\n');

  // Build rules and examples based on allowDM setting
  const dmRules = allowDM
    ? `- If a response should be a direct message to a specific member, include a "target" field with the target member ID or "user"
- If no "target" field is provided, the response will be a group message visible to everyone`
    : `- All responses will be group messages visible to everyone (DMs are not allowed in this group)`;

  const dmExamples = allowDM
    ? `- Group responses: [{"id": "agt_01"}]
- With instructions: [{"id": "agt_01", "instruction": "Outline the main points from the article"}]
- DM responses: [{"id": "agt_01", "target": "agt_02"}, {"id": "agt_04", "target": "user"}]
- Mixed responses: [{"id": "agt_01"}, {"id": "agt_02", "target": "user", "instruction": "Provide a summary"}]`
    : `- Group responses: [{"id": "agt_01"}]
- With instructions: [{"id": "agt_01", "instruction": "Outline the main points from the article"}]
- Multiple agents: [{"id": "agt_01"}, {"id": "agt_02", "instruction": "Provide a summary"}]`;

  const naturalFlowRule = allowDM
    ? `- Your goal is to make the conversation as natural as possible. For example, if user DM to an agent, the agent is likely to respond to the user privately too`
    : `- Your goal is to make the conversation as natural as possible in group format`;

  const prompt = `
You are a conversation supervisor for a group chat with multiple AI agents. Your role is to decide which agents should respond next based on the conversation context. Here's the group detail:

<group_role>
${systemPrompt || ''}
</group_role>

<group_members>
${memberList}
</group_members>

<conversation_history>
${conversationHistory}
</conversation_history>

Rules:
- Share your decision on who should respond next in a concise format
${dmRules}
- You can optionally include an "instruction" field to give specific guidance in English to the agent about what they should focus on or how they should respond
- If the conversation seems complete, or no one needs reply, return empty array []
${naturalFlowRule}

Examples:
${dmExamples}
- Stop conversation: []

Now share your decision.
`;

  return prompt.trim();
};

/**
 * Build the prompt for agents to respond in group chat context
 * This is the most impressive prompt since it's the last message
 */
export const buildAgentResponsePrompt = ({
  targetId,
  instruction,
}: {
  instruction?: string;
  targetId?: string;
}): string => {
  const targetText = targetId ? targetId : 'the group publicly';
  const instructionText = instruction ? `\n\nSupervisor instruction: ${instruction}` : '';

  return `Now it's your turn to respond. You are sending message to ${targetText}. Please respond as this agent would, considering the full conversation history provided above.${instructionText} Directly return the message content, no other text. You do not need add author name or anything else.`;
};

export const groupChatPrompts = {
  buildAgentResponsePrompt,
  buildGroupChatSystemPrompt,
  buildSupervisorPrompt,
};
