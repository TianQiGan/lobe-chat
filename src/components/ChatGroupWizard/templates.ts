export interface GroupTemplate {
  description: string;
  id: string;
  members: Array<{
    avatar: string;
    backgroundColor?: string;
    title: string;
  }>;
  title: string;
}

export const groupTemplates: GroupTemplate[] = [
  {
    description: 'Creative thinking with diverse perspectives',
    id: 'brainstorm',
    members: [
      {
        avatar: '🧠',
        backgroundColor: '#E8F5FF',
        title: 'Creative Director',
      },
      {
        avatar: '💡',
        backgroundColor: '#FFF7E8',
        title: 'Innovation Specialist',
      },
      {
        avatar: '🎨',
        backgroundColor: '#F6E8FF',
        title: 'Design Thinker',
      },
    ],
    title: 'Brainstorming Team',
  },
  {
    description: 'Data analysis and research team',
    id: 'analysis',
    members: [
      {
        avatar: '📊',
        backgroundColor: '#E8F8F5',
        title: 'Data Analyst',
      },
      {
        avatar: '🔍',
        backgroundColor: '#E8F5FF',
        title: 'Research Specialist',
      },
      {
        avatar: '📈',
        backgroundColor: '#FFF7E8',
        title: 'Statistics Expert',
      },
      {
        avatar: '🧮',
        backgroundColor: '#F0F8FF',
        title: 'Quantitative Analyst',
      },
    ],
    title: 'Analysis Squad',
  },
  {
    description: 'Content creation and editing team',
    id: 'writing',
    members: [
      {
        avatar: '✍️',
        backgroundColor: '#F6E8FF',
        title: 'Content Writer',
      },
      {
        avatar: '📝',
        backgroundColor: '#E8F8F5',
        title: 'Editor',
      },
    ],
    title: 'Writing Circle',
  },
  {
    description: 'Strategic planning and project management',
    id: 'planning',
    members: [
      {
        avatar: '📋',
        backgroundColor: '#E8F5FF',
        title: 'Project Manager',
      },
      {
        avatar: '🎯',
        backgroundColor: '#FFF7E8',
        title: 'Strategy Lead',
      },
      {
        avatar: '📅',
        backgroundColor: '#F0F8FF',
        title: 'Planning Coordinator',
      },
    ],
    title: 'Planning Committee',
  },
];