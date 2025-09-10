import { useTranslation } from 'react-i18next';

export interface GroupTemplate {
  description: string;
  id: string;
  members: Array<{
    avatar: string;
    backgroundColor?: string;
    systemRole: string;
    title: string;
  }>;
  title: string;
}

export const useGroupTemplates = (): GroupTemplate[] => {
  const { t } = useTranslation('welcome');

  const templateKeys = ['brainstorm', 'analysis', 'writing', 'planning'] as const;

  return templateKeys.map((key) => ({
    description: t(`guide.groupTemplates.${key}.description`),
    id: key,
    members: t(`guide.groupTemplates.${key}.members`, { returnObjects: true }) as GroupTemplate['members'],
    title: t(`guide.groupTemplates.${key}.title`),
  }));
};

// Fallback for components that need static data
export const groupTemplates: GroupTemplate[] = [
  {
    description: '多视角创意思维，激发无限可能',
    id: 'brainstorm',
    members: [
      {
        avatar: '🧠',
        backgroundColor: '#E8F5FF',
        systemRole: '你是一位创意总监，擅长从宏观角度把控创意方向，能够将抽象概念转化为具体可执行的创意方案。',
        title: '创意总监',
      },
      {
        avatar: '💡',
        backgroundColor: '#FFF7E8',
        systemRole: '你是创新专家，专门负责发现新颖的解决方案和突破性思维，善于跳出固有框架思考问题。',
        title: '创新专家',
      },
      {
        avatar: '🎨',
        backgroundColor: '#F6E8FF',
        systemRole: '你是设计思维专家，从用户体验和视觉呈现角度思考问题，注重创意的可视化表达。',
        title: '设计思维师',
      },
    ],
    title: '头脑风暴团队',
  },
  {
    description: '数据驱动洞察，深度研究分析',
    id: 'analysis',
    members: [
      {
        avatar: '📊',
        backgroundColor: '#E8F8F5',
        systemRole: '你是数据分析师，擅长处理和解释数据，通过图表和统计分析揭示数据背后的规律和趋势。',
        title: '数据分析师',
      },
      {
        avatar: '🔍',
        backgroundColor: '#E8F5FF',
        systemRole: '你是研究专家，专门负责信息收集和深度调研，能够从多个维度全面分析问题。',
        title: '研究专家',
      },
      {
        avatar: '📈',
        backgroundColor: '#FFF7E8',
        systemRole: '你是统计专家，精通各种统计方法和模型，能够从数据中提取有价值的商业洞察。',
        title: '统计专家',
      },
      {
        avatar: '🧮',
        backgroundColor: '#F0F8FF',
        systemRole: '你是量化分析师，专门进行量化建模和风险评估，用数学方法解决复杂问题。',
        title: '量化分析师',
      },
    ],
    title: '分析小队',
  },
  {
    description: '内容创作与编辑，打造优质文案',
    id: 'writing',
    members: [
      {
        avatar: '✍️',
        backgroundColor: '#F6E8FF',
        systemRole: '你是内容写手，擅长创作各类文体的内容，能够根据不同场景和受众调整写作风格。',
        title: '内容写手',
      },
      {
        avatar: '📝',
        backgroundColor: '#E8F8F5',
        systemRole: '你是编辑，负责文本的校对、润色和优化，确保内容的准确性、流畅性和专业性。',
        title: '编辑',
      },
    ],
    title: '写作圈',
  },
  {
    description: '策略规划与项目管理，统筹全局',
    id: 'planning',
    members: [
      {
        avatar: '📋',
        backgroundColor: '#E8F5FF',
        systemRole: '你是项目经理，负责项目的整体规划、进度管控和资源协调，确保项目按时高质量完成。',
        title: '项目经理',
      },
      {
        avatar: '🎯',
        backgroundColor: '#FFF7E8',
        systemRole: '你是策略负责人，专门制定长期战略规划，分析市场机会，制定目标和实现路径。',
        title: '策略负责人',
      },
      {
        avatar: '📅',
        backgroundColor: '#F0F8FF',
        systemRole: '你是规划协调员，负责制定详细的执行计划，协调各部门资源，确保计划的可执行性。',
        title: '规划协调员',
      },
    ],
    title: '规划委员会',
  },
];